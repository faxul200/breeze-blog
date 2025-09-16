import Head from 'next/head';
import Link from 'next/link';
import { fetchPublishedPosts } from '../../lib/supabase';
import { format } from 'date-fns';
import HeroIntro from '../../components/HeroIntro';
import PostGrid from '../../components/PostGrid';
import { getSiteMeta } from '../../lib/siteMeta';

export async function getServerSideProps(context) {
  try {
    const { query } = context;
    const search = query.search ? String(query.search).trim() : '';
    const category = query.category ? String(query.category).trim() : '';
    let posts = await fetchPublishedPosts();
    if (search) {
      const lower = search.toLowerCase();
      posts = posts.filter(post => post.title && post.title.toLowerCase().includes(lower));
    }
    if (category && ['distance','feel','design'].includes(category)) {
      posts = posts.filter(post => post.category === category);
    }
    return { props: { posts, search, category } };
  } catch (e) {
    return { props: { posts: [], error: e.message ?? 'Failed to load posts' } };
  }
}

export default function PostsIndex({ posts, error, search, category }) {
  const { title: siteTitle, description: siteDesc } = getSiteMeta();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const categoryLabel = category === 'distance' ? '비거리' : category === 'feel' ? '타구감' : category === 'design' ? '디자인' : '전체';

  return (
    <div className="container">
      <HeroIntro title={siteTitle} description={siteDesc} siteUrl={`${siteUrl}/posts`} />
      {(search || category) && (
        <p className="muted">
          {category && <span>카테고리: <strong>{categoryLabel}</strong> </span>}
          {search && <span>검색어: <strong>{search}</strong> </span>}
          ({posts.length}건)
        </p>
      )}
      {error ? (
        <p className="muted">{error}</p>
      ) : null}
      <PostGrid posts={posts} />
    </div>
  );
}



