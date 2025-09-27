// supabase/functions/ai-blog-generator/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { getPromptByCategory, PRODUCT_EXTRACTION_PROMPT } from '../../../lib/ai-prompts.js';

interface BlogPost {
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string;
  image_url: string;
  author: string;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    const userAgent = req.headers.get('user-agent') || '';
    
    // GitHub webhook인지 직접 API 호출인지 구분
    const isGitHubWebhook = userAgent.includes('GitHub-Hookshot') || 
                           req.headers.get('X-GitHub-Event') !== null;

    if (isGitHubWebhook) {
      // GitHub Webhook 처리
      return await handleGitHubWebhook(req);
    } else {
      // 직접 API 호출 처리
      return await handleDirectApiCall(req);
    }

  } catch (error) {
    console.error('❌ Error in main handler:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// GitHub Webhook 처리
async function handleGitHubWebhook(req: Request): Promise<Response> {
  let body: any;

  // GitHub Webhook 서명 검증 (선택사항)
  const secret = Deno.env.get('GITHUB_WEBHOOK_SECRET');
  if (secret) {
    const signature = req.headers.get('X-Hub-Signature-256') || '';
    const rawBody = await req.text();
    
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const mac = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
    const digest = 'sha256=' + Array.from(new Uint8Array(mac))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (signature !== digest) {
      return new Response('Invalid signature', { status: 401 });
    }
    
    try {
      body = JSON.parse(rawBody);
    } catch (_) {
      return new Response('Invalid JSON', { status: 400 });
    }
  } else {
    try {
      body = await req.json();
    } catch (e) {
      return new Response('Invalid JSON', { status: 400 });
    }
  }

  const commits = body.commits || [];
  let processedImages: string[] = [];
  let errors: string[] = [];

  console.log(`📦 Received ${commits.length} commits from GitHub`);

  for (const commit of commits) {
    // images_auto/ 폴더에서 추가된 파일만 처리
    const addedImages = (commit.added || []).filter(f => f.startsWith('images_auto/'));
    
    if (addedImages.length === 0) {
      console.log(`⏭️ Commit ${commit.id} has no images_auto files, skipping`);
      continue;
    }

    console.log(`🖼️ Processing ${addedImages.length} images from commit ${commit.id} as one blog post`);

    try {
      // 커밋의 모든 이미지를 하나의 블로그 포스트로 생성
      const result = await generateBlogPostFromMultipleImages(addedImages, commit.message || commit.id);
      if (result.success) {
        processedImages.push(...addedImages);
        console.log(`✅ Successfully created blog post with ${addedImages.length} images`);
      } else {
        errors.push(`Commit ${commit.id}: ${result.error}`);
        console.error(`❌ Failed to process commit ${commit.id} - ${result.error}`);
      }
    } catch (error) {
      const errorMsg = `Commit ${commit.id}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`❌ Exception processing commit ${commit.id}:`, error);
    }
  }

  const response = {
    success: true,
    processed: processedImages.length,
    processedImages,
    errors: errors.length > 0 ? errors : undefined,
    message: `Processed ${processedImages.length} images successfully`
  };

  return new Response(JSON.stringify(response, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// 직접 API 호출 처리 (기존 호환성 유지)
async function handleDirectApiCall(req: Request): Promise<Response> {
  const { imagePath, imageUrls, productName, category = 'general' } = await req.json();

  // 여러 이미지 처리
  if (imageUrls && Array.isArray(imageUrls)) {
    const result = await generateBlogPostFromMultipleImages(imageUrls, productName);
    
    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        blogPost: result.data,
        message: 'Blog post generated from multiple images successfully'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ 
        error: result.error 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 단일 이미지 처리 (기존 방식 유지)
  if (!imagePath) {
    return new Response(JSON.stringify({ error: 'Image path or imageUrls is required' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // images_auto 폴더가 아니면 스킵
  if (!imagePath.startsWith('images_auto/')) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Not an images_auto folder image, skipping AI generation.'
    }), { 
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const result = await generateBlogPostFromImage(imagePath, productName, category);

  if (result.success) {
    return new Response(JSON.stringify({
      success: true,
      blogPost: result.data,
      message: 'Blog post generated and saved successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    return new Response(JSON.stringify({ 
      error: result.error 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 여러 이미지로 하나의 블로그 포스트 생성 (새로운 메인 함수)
async function generateBlogPostFromMultipleImages(
  imagePaths: string[], 
  commitMessageOrProductName?: string
): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
  
  try {
    if (imagePaths.length === 0) {
      return { success: false, error: 'No images provided' };
    }

    console.log(`🔍 Processing ${imagePaths.length} images for one blog post`);

    // 첫 번째 이미지로 제품명과 카테고리 추출
    const extractionResult = await extractProductInfo(imagePaths[0]);
    let productName = commitMessageOrProductName || '제품명 미상';
    let category = 'general';

    if (extractionResult.success) {
      productName = extractionResult.data.productName;
      category = extractionResult.data.category;
    } else {
      // 추출 실패시 파일명에서 추출
      productName = commitMessageOrProductName || extractProductNameFromPath(imagePaths[0]);
      category = determineCategory(imagePaths[0]);
    }

    console.log(`🔍 Product: ${productName} | Category: ${category} | Images: ${imagePaths.length}`);

    const aiResponse = await callOpenAIWithMultipleImages(imagePaths, productName, category);
    
    if (!aiResponse.success) {
      return { success: false, error: aiResponse.error };
    }

    const blogPost = await saveBlogPost(aiResponse.data);
    
    return { success: true, data: blogPost };
    
  } catch (error) {
    console.error('❌ Error generating blog post from multiple images:', error);
    return { success: false, error: error.message };
  }
}
// 단일 이미지로 블로그 포스트 생성 (기존 호환성 유지)
async function generateBlogPostFromImage(
  imagePath: string, 
  productName?: string, 
  category?: string
): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
  
  try {
    let finalProductName = productName;
    let finalCategory = category;

    // 제품명과 카테고리가 없으면 AI로 추출
    if (!productName || !category) {
      console.log(`🔍 Extracting product info from image: ${imagePath}`);
      
      const extractionResult = await extractProductInfo(imagePath);
      if (extractionResult.success) {
        finalProductName = finalProductName || extractionResult.data.productName;
        finalCategory = finalCategory || extractionResult.data.category;
      } else {
        // 추출 실패시 파일명에서 추출
        finalProductName = finalProductName || extractProductNameFromPath(imagePath);
        finalCategory = finalCategory || determineCategory(imagePath);
      }
    }

    console.log(`🔍 Processing: ${imagePath} | Product: ${finalProductName} | Category: ${finalCategory}`);

    const aiResponse = await callOpenAI(imagePath, finalProductName, finalCategory);
    
    if (!aiResponse.success) {
      return { success: false, error: aiResponse.error };
    }

    const blogPost = await saveBlogPost(aiResponse.data);
    
    return { success: true, data: blogPost };
    
  } catch (error) {
    console.error('❌ Error generating blog post:', error);
    return { success: false, error: error.message };
  }
}

// 이미지에서 제품명과 카테고리 추출
async function extractProductInfo(imagePath: string): Promise<{ success: boolean; data?: { productName: string; category: string }; error?: string }> {
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable not found');
    }

    const fullImageUrl = convertToGitHubRawUrl(imagePath);
    const prompt = PRODUCT_EXTRACTION_PROMPT.replace('{imagePath}', imagePath);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'user', 
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: fullImageUrl } }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Product extraction failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      const extracted = JSON.parse(content);
      return {
        success: true,
        data: {
          productName: extracted.productName || '제품명 미상',
          category: extracted.category || 'general'
        }
      };
    } catch {
      return { success: false, error: 'Failed to parse extraction result' };
    }

  } catch (error) {
    console.error('❌ Product extraction failed:', error);
    return { success: false, error: error.message };
  }
}

// 여러 이미지를 한번에 OpenAI로 처리
async function callOpenAIWithMultipleImages(imagePaths: string[], productName: string, category: string) {
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable not found');
    }

    // 모든 이미지를 GitHub raw URL로 변환
    const imageUrls = imagePaths.map(path => convertToGitHubRawUrl(path));
    console.log(`🔗 Processing ${imageUrls.length} images:`, imageUrls);

    // lib/ai-prompts.js의 전문 프롬프트 사용 (여러 이미지 URL 전달)
    const prompt = getPromptByCategory(category, imageUrls.join('\n'), productName);

    // 메시지 구성: 텍스트 프롬프트 + 모든 이미지들
    const messageContent = [
      { type: 'text', text: prompt },
      ...imageUrls.map(url => ({ 
        type: 'image_url' as const, 
        image_url: { url } 
      }))
    ];

    const requestPayload = {
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'user', 
          content: messageContent
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // HTML에서 제목 추출
    const titleMatch = content.match(/<h2[^>]*>(.*?)<\/h2>/i);
    const title = titleMatch ? titleMatch[1] : productName + ' 리뷰';

    // ai-prompts.js 스타일의 메타데이터 추출
    const titleMetaMatch = content.match(/<strong>title<\/strong>:\s*(.+?)(?=\n|<strong>|$)/s);
    const summaryMetaMatch = content.match(/<strong>summary<\/strong>:\s*(.+?)(?=\n|<strong>|$)/s);
    const tagsMetaMatch = content.match(/<strong>tags<\/strong>:\s*(.+?)(?=\n|<strong>|$)/s);
    const categoryMetaMatch = content.match(/<strong>category<\/strong>:\s*(.+?)(?=\n|<strong>|$)/s);

    const finalTitle = titleMetaMatch ? titleMetaMatch[1].trim() : title;
    const summary = summaryMetaMatch ? summaryMetaMatch[1].trim() : 
                   content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
    const tags = tagsMetaMatch ? tagsMetaMatch[1].trim() : '';
    const finalCategory = categoryMetaMatch ? categoryMetaMatch[1].trim() : category;

    // 메타데이터 부분 제거하여 깨끗한 컨텐츠 생성
    const cleanContent = content
      .replace(/<strong>title<\/strong>:\s*.+?(?=\n|$)/gs, '')
      .replace(/<strong>summary<\/strong>:\s*.+?(?=\n|$)/gs, '')
      .replace(/<strong>tags<\/strong>:\s*.+?(?=\n|$)/gs, '')
      .replace(/<strong>category<\/strong>:\s*.+?(?=\n|$)/gs, '')
      .trim();

    return {
      success: true,
      data: {
        title: finalTitle,
        content: cleanContent,
        summary,
        category: finalCategory,
        tags,
        image_url: imageUrls[0], // 첫 번째 이미지를 대표 이미지로
        author: 'AI 블로거'
      }
    };

  } catch (error) {
    console.error('❌ OpenAI API call with multiple images failed:', error);
    return { success: false, error: error.message };
  }
}
// 단일 이미지 OpenAI 호출 (기존 호환성 유지)
async function callOpenAI(imagePath: string, productName: string, category: string) {
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable not found');
    }

    const fullImageUrl = convertToGitHubRawUrl(imagePath);
    console.log(`🔗 Image URL: ${fullImageUrl}`);

    // lib/ai-prompts.js의 전문 프롬프트 사용
    const prompt = getPromptByCategory(category, fullImageUrl, productName);

    const requestPayload = {
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'user', 
          content: [
            { type: 'text', text: prompt }, 
            { type: 'image_url', image_url: { url: fullImageUrl } }
          ] 
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // HTML에서 제목 추출
    const titleMatch = content.match(/<h2[^>]*>(.*?)<\/h2>/i);
    const title = titleMatch ? titleMatch[1] : productName + ' 리뷰';

    // ai-prompts.js 스타일의 메타데이터 추출
    const titleMetaMatch = content.match(/<strong>title<\/strong>:\s*(.+?)(?=\n|<strong>|$)/s);
    const summaryMetaMatch = content.match(/<strong>summary<\/strong>:\s*(.+?)(?=\n|<strong>|$)/s);
    const tagsMetaMatch = content.match(/<strong>tags<\/strong>:\s*(.+?)(?=\n|<strong>|$)/s);
    const categoryMetaMatch = content.match(/<strong>category<\/strong>:\s*(.+?)(?=\n|<strong>|$)/s);

    const finalTitle = titleMetaMatch ? titleMetaMatch[1].trim() : title;
    const summary = summaryMetaMatch ? summaryMetaMatch[1].trim() : 
                   content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
    const tags = tagsMetaMatch ? tagsMetaMatch[1].trim() : '';
    const finalCategory = categoryMetaMatch ? categoryMetaMatch[1].trim() : category;

    // 메타데이터 부분 제거하여 깨끗한 컨텐츠 생성
    const cleanContent = content
      .replace(/<strong>title<\/strong>:\s*.+?(?=\n|$)/gs, '')
      .replace(/<strong>summary<\/strong>:\s*.+?(?=\n|$)/gs, '')
      .replace(/<strong>tags<\/strong>:\s*.+?(?=\n|$)/gs, '')
      .replace(/<strong>category<\/strong>:\s*.+?(?=\n|$)/gs, '')
      .trim();

    return {
      success: true,
      data: {
        title: finalTitle,
        content: cleanContent,
        summary,
        category: finalCategory,
        tags,
        image_url: fullImageUrl,
        author: 'AI 블로거'
      }
    };

  } catch (error) {
    console.error('❌ OpenAI API call failed:', error);
    return { success: false, error: error.message };
  }
}

// Supabase에 블로그 포스트 저장
async function saveBlogPost(post: BlogPost): Promise<BlogPost> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not found in environment variables');
  }

  const nextId = await getNextPostId(supabaseUrl, supabaseKey);
  const author = '팍술'; // 고정값
  
  // image_url: 첫 번째 이미지만 사용하여 메인페이지 목록용
  const mainImageUrl = Array.isArray(post.image_url) 
    ? post.image_url[0]  // 배열인 경우 첫 번째
    : post.image_url;    // 문자열인 경우 그대로
    
  const cleanImageUrl = sanitizeImageUrl(mainImageUrl);

  const blogData = {
    id: nextId,
    title: post.title,
    summary: post.summary, 
    content: post.content,
    created_at: new Date().toISOString(),
    author,
    image_url: cleanImageUrl, // 첫 번째 이미지만 저장
    tags: post.tags,
    display_yn: 'Y', // 화면 표시 여부 고정값
    category: post.category // distance, feel, design 중 하나
  };

  console.log(`💾 Saving blog post:`, {
    id: blogData.id,
    title: blogData.title,
    author: blogData.author,
    category: blogData.category,
    image_url: blogData.image_url
  });

  const response = await fetch(`${supabaseUrl}/rest/v1/tb_blog_posts`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(blogData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to save blog post: ${response.status} - ${errorText}`);
  }
  
  const savedPost = await response.json();
  console.log(`💾 Blog post saved successfully with ID: ${nextId}`);
  
  return savedPost[0] || savedPost;
}

// 유틸리티 함수들
async function getNextPostId(supabaseUrl: string, supabaseKey: string): Promise<number> {
  const res = await fetch(`${supabaseUrl}/rest/v1/tb_blog_posts?select=id&order=id.desc&limit=1`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  
  if (!res.ok) throw new Error('Failed to fetch max id');
  
  const rows = await res.json();
  const maxId = Array.isArray(rows) && rows.length > 0 ? Number(rows[0].id) : 0;
  return Number.isFinite(maxId) ? maxId + 1 : 1;
}

function sanitizeImageUrl(url: string): string {
  if (!url) return url;
  return url.startsWith('@') ? url.slice(1) : url;
}

function convertToGitHubRawUrl(imagePath: string): string {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:image/')) {
    return imagePath;
  }
  
  const baseUrl = 'https://raw.githubusercontent.com/faxul200/blog-assets/main/';
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return baseUrl + cleanPath;
}

function extractProductNameFromPath(imagePath: string): string {
  const filename = imagePath.split('/').pop() || '';
  const nameWithoutExt = filename.split('.')[0];
  return nameWithoutExt.replace(/[-_]/g, ' ');
}

function determineCategory(imagePath: string): string {
  const path = imagePath.toLowerCase();
  
  if (path.includes('golf') || path.includes('ball')) {
    return 'golf';
  } else if (path.includes('tech') || path.includes('electronic')) {
    return 'tech';
  } else {
    return 'general';
  }
}