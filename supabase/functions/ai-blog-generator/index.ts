// supabase/functions/ai-blog-generator/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

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
    const { imagePath, productName, category = 'general' } = await req.json();

    if (!imagePath) {
      return new Response('Image path is required', { status: 400 });
    }

    // AI API 호출 (OpenAI, Claude 등)
    const aiResponse = await callAI(imagePath, productName, category);
    
    if (!aiResponse.success) {
      return new Response(JSON.stringify({ error: aiResponse.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Supabase에 블로그 글 저장
    const blogPost = await saveBlogPost(aiResponse.data);

    return new Response(JSON.stringify({
      success: true,
      blogPost,
      message: 'Blog post generated and saved successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating blog post:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// AI API 호출 함수
async function callAI(imagePath: string, productName: string, category: string) {
  try {
    // OpenAI API 호출 예시
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found');
    }

    const prompt = getPromptByCategory(category, imagePath, productName);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imagePath } }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // HTML에서 제목과 내용 추출
    const titleMatch = content.match(/<h2[^>]*>(.*?)<\/h2>/i);
    const title = titleMatch ? titleMatch[1] : productName + ' 리뷰';
    
    // 메타데이터 추출 (본문 끝의 <strong> 태그들)
    const titleMetaMatch = content.match(/<strong>title<\/strong>:\s*(.+?)(?=<strong>|$)/i);
    const summaryMetaMatch = content.match(/<strong>summary<\/strong>:\s*(.+?)(?=<strong>|$)/i);
    const tagsMetaMatch = content.match(/<strong>tags<\/strong>:\s*(.+?)(?=<strong>|$)/i);
    const categoryMetaMatch = content.match(/<strong>category<\/strong>:\s*(.+?)(?=<strong>|$)/i);
    
    const finalTitle = titleMetaMatch ? titleMetaMatch[1].trim() : title;
    const summary = summaryMetaMatch ? summaryMetaMatch[1].trim() : content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
    const tags = tagsMetaMatch ? tagsMetaMatch[1].trim() : '';
    const finalCategory = categoryMetaMatch ? categoryMetaMatch[1].trim() : category;
    
    // 메타데이터 제거 (본문에서 <strong> 태그 부분 삭제)
    const cleanContent = content.replace(/<strong>title<\/strong>:.+?<strong>category<\/strong>:\s*.+?(?=\n|$)/gs, '').trim();

    return {
      success: true,
      data: {
        title: finalTitle,
        content: cleanContent,
        summary,
        category: finalCategory,
        tags,
        image_url: imagePath,
        author: 'AI 블로거'
      }
    };

  } catch (error) {
    console.error('AI API call failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Supabase에 블로그 글 저장
async function saveBlogPost(post: BlogPost) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not found');
  }

  // 현재 최대 id 조회 후 +1 할당
  const nextId = await getNextPostId(supabaseUrl, supabaseKey);

  // 작성자 고정, 이미지 URL 정제
  const author = '팍술';
  const imageUrl = sanitizeImageUrl(post.image_url);

  const response = await fetch(`${supabaseUrl}/rest/v1/tb_blog_posts`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      id: nextId,
      title: post.title,
      summary: post.summary,
      content: post.content,
      created_at: new Date().toISOString(),
      author,
      image_url: imageUrl,
      tags: post.tags,
      display_yn: 'Y',
      category: post.category,
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to save blog post: ${response.statusText}`);
  }

  return await response.json();
}

async function getNextPostId(supabaseUrl: string, supabaseKey: string): Promise<number> {
  const res = await fetch(`${supabaseUrl}/rest/v1/tb_blog_posts?select=id&order=id.desc&limit=1`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    }
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

// 프롬프트 선택 함수 (간단 버전)
function getPromptByCategory(category: string, imagePath: string, productName: string): string {
  const basePrompt = `
당신은 전문 블로거입니다. 다음 이미지를 분석하여 상세한 제품 리뷰 글을 작성해주세요.

**이미지 경로**: ${imagePath}
**제품명**: ${productName}

**작성 요구사항**:
1. 제목: "제품명 상세 리뷰 - 실제 사용 후기"
2. 구조:
   - 제품 정보 표
   - 외관 및 디자인 분석
   - 성능 및 사용성 평가
   - 장단점 정리
   - 추천 대상
   - 총평

3. 톤앤매너: 전문적이면서도 친근한 블로그 스타일
4. 길이: 2000-3000자
5. HTML 형식으로 작성 (h3, table, ul, li, strong 태그 활용)

**주의사항**:
- 실제 사용 경험을 바탕으로 한 구체적인 내용
- 마케팅 문구보다는 솔직한 평가
- 초보자도 이해할 수 있는 설명
`;

  return basePrompt;
}
