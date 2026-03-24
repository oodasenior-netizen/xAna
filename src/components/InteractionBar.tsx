"use client";

import { useState } from "react";

export function InteractionBar({
  likes = 0,
  comments = 0,
  itemId,
}: {
  likes?: number;
  comments?: number;
  itemId: string;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [bookmarked, setBookmarked] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [tipped, setTipped] = useState(false);

  return (
    <>
      <div className="interaction-bar">
        <button
          className={`ix-btn ${liked ? "active" : ""}`}
          onClick={() => {
            setLiked(!liked);
            setLikeCount((c) => (liked ? c - 1 : c + 1));
          }}
          aria-label="Like"
        >
          <span className="ix-icon">{liked ? "❤️" : "🤍"}</span>
          <span>{likeCount}</span>
        </button>

        <button
          className={`ix-btn ${showComment ? "active" : ""}`}
          onClick={() => setShowComment(!showComment)}
          aria-label="Comment"
        >
          <span className="ix-icon">💬</span>
          <span>{comments}</span>
        </button>

        <button
          className={`ix-btn ${tipped ? "active" : ""}`}
          onClick={() => setTipped(true)}
          aria-label="Tip"
        >
          <span className="ix-icon">{tipped ? "🌸" : "🪙"}</span>
          <span>{tipped ? "Sent!" : "Tip"}</span>
        </button>

        <div className="ix-spacer" />

        <button
          className={`ix-btn ${bookmarked ? "active" : ""}`}
          onClick={() => setBookmarked(!bookmarked)}
          aria-label="Bookmark"
        >
          <span className="ix-icon">{bookmarked ? "🔖" : "📑"}</span>
        </button>
      </div>

      {showComment && (
        <div style={{ padding: "0 0.8rem 0.6rem" }}>
          <input
            type="text"
            placeholder="Leave a comment…"
            style={{
              width: "100%",
              padding: "0.55rem 0.7rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--glass-border)",
              background: "var(--bg-warm)",
              color: "var(--ink)",
              fontSize: "0.85rem",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setShowComment(false);
              }
            }}
          />
        </div>
      )}
    </>
  );
}
