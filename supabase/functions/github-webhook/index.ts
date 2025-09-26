// supabase/functions/github-webhook/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 선택: GitHub Webhook 서명 검증
  const secret = Deno.env.get('GITHUB_WEBHOOK_SECRET');
  if (secret) {
    const signature = req.headers.get('X-Hub-Signature-256') || '';
    const rawBody = await req.text();
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const mac = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
    const digest = 'sha256=' + Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (signature !== digest) {
      return new Response('Invalid signature', { status: 401 });
    }
    // 검증을 위해 rawBody를 이미 소비했으므로 JSON을 다시 파싱할 수 있도록 보정
    // GitHub에서 재파싱이 필요하므로 rawBody를 사용
    try {
      var body = JSON.parse(rawBody);
    } catch (_) {
      return new Response('Invalid JSON', { status: 400 });
    }
    // 아래 로직을 그대로 수행
    return await handleWebhook(body);
  }

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 });
  }

  return await handleWebhook(body);
});

async function handleWebhook(body: any): Promise<Response> {
  const commits = body.commits || [];
  let addedImages: string[] = [];
  let removedImages: string[] = [];

  for (const commit of commits) {
    const added = (commit.added || []).filter(f => f.startsWith('images/'));
    const removed = (commit.removed || []).filter(f => f.startsWith('images/'));

    if (added.length) addedImages.push(...added);
    if (removed.length) removedImages.push(...removed);
  }

  // 중복 제거
  addedImages = Array.from(new Set(addedImages));
  removedImages = Array.from(new Set(removedImages));

  // 로그에 작업한 것만 표시
  if (addedImages.length) console.log('Added:', addedImages);
  if (removedImages.length) console.log('Removed:', removedImages);

  // AI 블로그 생성 호출 (새로 추가된 이미지가 있을 때만)
  if (addedImages.length > 0) {
    for (const imagePath of addedImages) {
      try {
        await generateBlogPost(imagePath);
      } catch (error) {
        console.error(`Failed to generate blog for ${imagePath}:`, error);
      }
    }
  }

  // Response에도 작업한 것만 포함
  const response: any = { received: true };
  if (addedImages.length) response.Added = addedImages;
  if (removedImages.length) response.Removed = removedImages;

  return new Response(JSON.stringify(response, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// AI 블로그 생성 함수
async function generateBlogPost(imagePath: string) {
  try {
    const aiBlogGeneratorUrl = Deno.env.get('AI_BLOG_GENERATOR_URL') || 
      'https://your-project.supabase.co/functions/v1/ai-blog-generator';
    
    const response = await fetch(aiBlogGeneratorUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({
        imagePath,
        productName: extractProductNameFromPath(imagePath),
        category: 'general'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`Blog post generated for ${imagePath}:`, result);
    } else {
      console.error(`Failed to generate blog post for ${imagePath}:`, response.statusText);
    }
  } catch (error) {
    console.error(`Error calling AI blog generator for ${imagePath}:`, error);
  }
}

function extractProductNameFromPath(imagePath: string): string {
  const filename = imagePath.split('/').pop() || '';
  const nameWithoutExt = filename.split('.')[0];
  return nameWithoutExt.replace(/[-_]/g, ' ');
}
