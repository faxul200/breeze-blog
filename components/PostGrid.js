import Link from 'next/link';
import { format } from 'date-fns';

export default function PostGrid({ posts }) {
  if (!posts || posts.length === 0) return null;
  return (
    <div className="post-grid">
      {posts.map((post) => (
        <article key={post.id} className="post-card">
          <Link href={`/posts/${post.id}`}>
            <div className="card-thumb">
              {post.image_url ? (
                <img src={post.image_url} alt={post.title} loading="lazy" />
              ) : null}
            </div>
          </Link>
          <div className="card-content">
            <div className="post-meta">{post.created_at ? format(new Date(post.created_at), 'yyyy.MM.dd') : ''}</div>
            <h2 className="post-title">
              <Link href={`/posts/${post.id}`}>{post.title}</Link>
            </h2>
          </div>
        </article>
      ))}
    </div>
  );
}
