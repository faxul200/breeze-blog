import { fetchPublishedPosts } from '../lib/supabase';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function generateSiteMap(posts) {
  const postsXml = posts
    .map((p) => {
      const loc = `${SITE_URL}/posts/${p.id}`;
      const lastmod = p.created_at || new Date().toISOString();
      return `<url><loc>${loc}</loc><lastmod>${new Date(lastmod).toISOString()}</lastmod></url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>${SITE_URL}</loc></url>
    ${postsXml}
  </urlset>`;
}

export async function getServerSideProps({ res }) {
  const posts = await fetchPublishedPosts();
  const sitemap = generateSiteMap(posts);
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
  return { props: {} };
}

export default function SiteMap() {
  return null;
}

