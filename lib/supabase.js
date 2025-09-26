import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function fetchPublishedPosts() {
  const { data, error } = await supabase
    .from('tb_blog_posts')
    .select('id, title, image_url, created_at, summary, category')
    .eq('display_yn', 'Y')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPostByIdOrSlug(idOrSlug) {
  const query = supabase
    .from('tb_blog_posts')
    .select('id, title, content, image_url, created_at, author, summary, tags, category')
    .eq('display_yn', 'Y')
    .limit(1);

  const isNumericId = /^\d+$/.test(String(idOrSlug));
  const builder = isNumericId ? query.eq('id', Number(idOrSlug)) : query.eq('id', -1);
  const { data, error } = await builder;
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

