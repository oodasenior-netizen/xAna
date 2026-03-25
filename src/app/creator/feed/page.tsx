import { requireCreator } from "@/lib/guards";
import { readStore } from "@/lib/store";
import { creatorDeletePost } from "@/app/actions";
import FeedCompose from "./FeedCompose";
import { Play } from "lucide-react";

type Props = { searchParams: Promise<{ published?: string; error?: string }> };

export default async function CreatorFeedPage({ searchParams }: Props) {
  await requireCreator();
  const sp = await searchParams;
  const { feedPosts } = await readStore();

  const statusBadge = (access: string) => {
    if (access === "subscription") return "🌿 Subs";
    if (access === "ppv") return "🔒 PPV";
    return "🌐 Free";
  };

  return (
    <section className="cr-page">
      <p className="eyebrow">Feed Manager</p>
      <h1 className="section-title">El Jardín — Posts</h1>

      {sp.published === "1" && (
        <div className="cr-toast cr-toast-success">✓ Post published — live on subscribers feed</div>
      )}
      {sp.error === "empty" && (
        <div className="cr-toast cr-toast-error">Title and content cannot be empty.</div>
      )}

      <FeedCompose />

      <div className="cr-feed-list">
        {feedPosts.length === 0 && (
          <p style={{ color: "var(--ink-muted)", padding: "1rem 0" }}>No posts yet.</p>
        )}
        {feedPosts.map((post) => (
          <article key={post.id} className="cr-feed-card">
            <div className="cr-feed-card-header">
              <h3>{post.title}</h3>
              <div className="cr-feed-badges">
                <span className="cr-badge">🟢 Live</span>
                <span className="cr-badge">{statusBadge(post.access)}</span>
                {post.videoUrl && <span className="cr-badge">🎬 Media</span>}
              </div>
            </div>
            <p className="cr-feed-body">{post.description}</p>
            {post.videoUrl && (
              <a href={post.videoUrl} target="_blank" rel="noreferrer" className="cr-feed-media-link">
                <Play size={12} /> Preview media
              </a>
            )}
            <div className="cr-feed-card-footer">
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments}</span>
              <span className="timestamp">{post.postedAt}</span>
              <form action={creatorDeletePost} style={{ marginLeft: "auto" }}>
                <input type="hidden" name="postId" value={post.id} />
                <button type="submit" className="cr-delete-btn">🗑 Delete</button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}