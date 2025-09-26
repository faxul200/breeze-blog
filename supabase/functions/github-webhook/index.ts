// supabase/functions/github-webhook/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 });
  }

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

  // Response에도 작업한 것만 포함
  const response: any = { received: true };
  if (addedImages.length) response.Added = addedImages;
  if (removedImages.length) response.Removed = removedImages;

  return new Response(JSON.stringify(response, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
});
