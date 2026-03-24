"use client";

import { useState } from "react";

type PostAccess = "subscription" | "ppv" | "free";
type PostStatus = "draft" | "published" | "scheduled";

const recentPosts = [
  { id: "p-001", title: "Golden Hour on the Terrace", body: "Caught this light just before the sun dipped behind the hills.", status: "published" as PostStatus, access: "subscription" as PostAccess, likes: 342, comments: 28, postedAt: "2 hours ago" },
  { id: "p-002", title: "Behind the Courtyard Shoot", body: "How we turned an old stone wall into the backdrop for the new collection.", status: "published" as PostStatus, access: "subscription" as PostAccess, likes: 218, comments: 15, postedAt: "Yesterday" },
  { id: "p-003", title: "Velvet Night (Extended Cut)", body: "The full uncut reel from the candlelit evening session.", status: "published" as PostStatus, access: "ppv" as PostAccess, likes: 189, comments: 42, postedAt: "2 days ago" },
  { id: "p-004", title: "Sneak Peek — April Bundle", body: "A little preview of what's coming next month. You're not ready.", status: "draft" as PostStatus, access: "subscription" as PostAccess, likes: 0, comments: 0, postedAt: "Draft" },
  { id: "p-005", title: "Friday Night Drop Vol. 4", body: "Exclusive content dropping this Friday at midnight.", status: "scheduled" as PostStatus, access: "ppv" as PostAccess, likes: 0, comments: 0, postedAt: "Scheduled: Mar 28" },
];

export default function CreatorFeedPage() {
  const [view, setView] = useState<"feed" | "compose">("feed");
  const [posts, setPosts] = useState(recentPosts);
  const [draft, setDraft] = useState({ title: "", body: "", access: "subscription" as PostAccess });
  const [published, setPublished] = useState(false);

  function publish() {
    if (!draft.title.trim() || !draft.body.trim()) return;
    setPosts((prev) => [
      {
        id: `p-${Date.now()}`,
        title: draft.title,
        body: draft.body,
        status: "published" as PostStatus,
        access: draft.access,
        likes: 0,
        comments: 0,
        postedAt: "Just now",
      },
      ...prev,
    ]);
    setPublished(true);
    setTimeout(() => {
      setDraft({ title: "", body: "", access: "subscription" });
      setView("feed");
      setPublished(false);
    }, 1000);
  }

  const statusBadge = (s: PostStatus) => {
    if (s === "published") return "🟢 Live";
    if (s === "draft") return "📝 Draft";
    return "🔵 Scheduled";
  };

  const accessBadge = (a: PostAccess) => {
    if (a === "subscription") return "🌿 Subs";
    if (a === "ppv") return "🔒 PPV";
    return "🌐 Free";
  };

  return (
    <section className="cr-page">
      <p className="eyebrow">Feed Manager</p>
      <h1 className="section-title">El Jardín — Posts</h1>

      <div className="cr-tabs">
        <button className={`cr-tab ${view === "feed" ? "active" : ""}`} onClick={() => setView("feed")}>
          📋 All Posts
        </button>
        <button className={`cr-tab ${view === "compose" ? "active" : ""}`} onClick={() => setView("compose")}>
          ✍️ New Post
        </button>
      </div>

      {/* ── Post Feed ─────────────────────────────────────── */}
      {view === "feed" && (
        <div className="cr-section">
          <div className="cr-feed-list">
            {posts.map((post) => (
              <article key={post.id} className="cr-feed-card">
                <div className="cr-feed-card-header">
                  <h3>{post.title}</h3>
                  <div className="cr-feed-badges">
                    <span className="cr-badge">{statusBadge(post.status)}</span>
                    <span className="cr-badge">{accessBadge(post.access)}</span>
                  </div>
                </div>
                <p className="cr-feed-body">{post.body}</p>
                <div className="cr-feed-card-footer">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                  <span className="timestamp">{post.postedAt}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* ── Compose ───────────────────────────────────────── */}
      {view === "compose" && (
        <div className="cr-section">
          <div className="cr-compose">
            <label className="cr-wizard-field">
              <span>Post Title</span>
              <input
                type="text"
                placeholder="What's on your mind?"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>

            <label className="cr-wizard-field">
              <span>Content</span>
              <textarea
                rows={6}
                placeholder="Write your post…"
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              />
            </label>

            <div className="cr-wizard-row">
              <label className="cr-wizard-field half">
                <span>Access Level</span>
                <select value={draft.access} onChange={(e) => setDraft({ ...draft, access: e.target.value as PostAccess })}>
                  <option value="subscription">Subscribers Only</option>
                  <option value="ppv">Pay-Per-View</option>
                  <option value="free">Free / Public</option>
                </select>
              </label>
              <label className="cr-wizard-field half">
                <span>Attachments</span>
                <button className="secondary-btn small" disabled>📎 Add Media</button>
              </label>
            </div>

            <div className="cr-compose-actions">
              <button className="secondary-btn small" disabled>💾 Save Draft</button>
              <button className="secondary-btn small" disabled>📅 Schedule</button>
              <button className="primary-btn" onClick={publish}>
                {published ? "✓ Published!" : "🚀 Publish Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
