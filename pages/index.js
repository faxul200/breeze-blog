import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { fetchPublishedPosts } from '../lib/supabase';
import { format } from 'date-fns';
import HeroIntro from '../components/HeroIntro';
import PostGrid from '../components/PostGrid';
import { getSiteMeta } from '../lib/siteMeta';

export async function getServerSideProps() {
  try {
    const posts = await fetchPublishedPosts();
    return { props: { posts } };
  } catch (e) {
    return { props: { posts: [], error: e.message ?? 'Failed to load posts' } };
  }
}

export default function Home({ posts, error }) {
  const { title: siteTitle, description: siteDesc } = getSiteMeta();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <div className="container">
      <HeroIntro 
        title={siteTitle} 
        description={siteDesc} 
        siteUrl={siteUrl} 
        descStyle={{ marginBottom: '56px' }}
      />

      {error ? (
        <p className="muted">{error}</p>
      ) : null}

      {posts && posts.length > 0 ? (
        <>
          <article className="post-card hero-card">
            <Link href={`/posts/${posts[0].id}`} className="card-overlay" aria-label={posts[0].title}></Link>
            <div className="badge-latest">최신 게시물</div>
            <Link href={`/posts/${posts[0].id}`}>
              <div className="hero-thumb">
                {posts[0].image_url ? (
                  <img src={posts[0].image_url} alt={posts[0].title} />
                ) : null}
              </div>
            </Link>
            <div className="hero-content">
              <div className="post-meta">
                {posts[0].created_at ? format(new Date(posts[0].created_at), 'yyyy.MM.dd') : ''}
              </div>
              <h2 className="hero-title">
                <Link href={`/posts/${posts[0].id}`}>{posts[0].title}</Link>
              </h2>
              {posts[0].summary ? (
                <p className="hero-summary">{posts[0].summary}</p>
              ) : null}
            </div>
          </article>

          <PostGrid posts={posts.slice(1)} />
        </>
      ) : null}
    </div>
  );
}

