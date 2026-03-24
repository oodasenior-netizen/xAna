"use client";

import { useState } from "react";
import { creatorPublishPost } from "@/app/actions";

type PostAccess = "subscription" | "ppv";
type MediaType = "text" | "video" | "audio" | "photo";

export default function FeedCompose() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  if (!open) {
    return (
      <button className="primary-btn" onClick={() => setOpen(true)}>
        ✍️ New Post
      </button>
    );
  }

  return (
    <div className="cr-compose">
      <form
        action={async (fd) => {
          setPending(true);
          await creatorPublishPost(fd);
          setPending(false);
        }}
      >
        <label className="cr-wizard-field">
          <span>Post Title *</span>
          <input
            name="title"
            type="text"
            placeholder="What's on your mind?"
            required
          />
        </label>

        <label className="cr-wizard-field">
          <span>Content *</span>
          <textarea
            name="description"
            rows={5}
            placeholder="Write your post…"
            required
          />
        </label>

        <div className="cr-wizard-row">
          <label className="cr-wizard-field half">
            <span>Access Level</span>
            <select name="access" defaultValue="subscription">
              <option value="subscription">Subscribers Only</option>
              <option value="ppv">Pay-Per-View</option>
            </select>
          </label>

          <label className="cr-wizard-field half">
            <span>Mood Tag</span>
            <select name="mood" defaultValue="Personal">
              <option value="Personal">Personal</option>
              <option value="BTS">BTS</option>
              <option value="Exclusive">Exclusive</option>
              <option value="PPV">PPV</option>
              <option value="Drop">Drop</option>
              <option value="Live">Live</option>
            </select>
          </label>
        </div>

        <div className="cr-wizard-row">
          <label className="cr-wizard-field half">
            <span>Media Type</span>
            <select name="mediaType" defaultValue="text">
              <option value="text">Text / Photo</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
          </label>

          <label className="cr-wizard-field half">
            <span>PPV Price ($)</span>
            <input name="priceCents" type="number" min="0" step="0.01" placeholder="0.00" />
          </label>
        </div>

        <label className="cr-wizard-field">
          <span>Video / Audio URL (optional)</span>
          <input
            name="videoUrl"
            type="url"
            placeholder="https://… direct link to your media file"
          />
        </label>

        <div className="cr-compose-actions">
          <button type="button" className="secondary-btn small" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button type="submit" className="primary-btn" disabled={pending}>
            {pending ? "Publishing…" : "🚀 Publish Now"}
          </button>
        </div>
      </form>
    </div>
  );
}
