import Head from 'next/head';
import { fetchPostByIdOrSlug } from '../../lib/supabase';
import { format } from 'date-fns';

export async function getServerSideProps({ params }) {
  try {
    const post = await fetchPostByIdOrSlug(params.id);
    if (!post) {
      return { notFound: true };
    }
    return { props: { post } };
  } catch (e) {
    return { notFound: true };
  }
}

export default function PostPage({ post }) {
  const title = `${post.title} | 나의 기술 블로그`;
  const desc = post.summary || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const canonical = `${siteUrl}/posts/${post.id}`;

  return (
    <div className="container">
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={canonical} />
        {post.image_url ? (
          <meta
            property="og:image"
            content={
              post.image_url.startsWith('http')
                ? post.image_url
                : `${siteUrl}${post.image_url.startsWith('/') ? '' : '/'}${post.image_url}`
            }
          />
        ) : null}
      </Head>

      <article>
        <header className="post-body">
          <h1 className="post-title-detail">{post.title}</h1>
          <div className="post-meta">
            {post.created_at ? format(new Date(post.created_at), 'yyyy.MM.dd') : ''}
            {post.author ? ` · ${post.author}` : ''}
          </div>
          {post.summary ? (
            <p className="muted" style={{ marginTop: 4 }}>{post.summary}</p>
          ) : null}
        </header>
        <div className="post-body">
          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </article>

      <ins className="adsbygoogle ads-slot"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
        data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT || ''}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

