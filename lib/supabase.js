import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://daeqwvmuhupwdgtltwad.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZXF3dm11aHVwd2RndGx0d2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODA1MTksImV4cCI6MjA2NjI1NjUxOX0.6rBbmiFZqIBhhyRcXnk7y2wiKPZQPLeCjNYBMV72Y34';

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

