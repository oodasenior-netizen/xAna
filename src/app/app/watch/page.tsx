"use client";

/**
 * /app/watch — branded media player page.
 *
 * Query params:
 *   key   — Bunny Storage key → fetches a signed CDN URL via /api/vault/play
 *   url   — Direct media URL (fallback for external content)
 *   title — Display title
 *   type  — "video" | "audio" (default: "video")
 */

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { PlyrPlayer } from "@/components/PlyrPlayer";
import { Loader2, ArrowLeft } from "lucide-react";

function WatchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const key = params.get("key");
  const directUrl = params.get("url");
  const title = params.get("title") ?? "Now Playing";
  const type = (params.get("type") as "video" | "audio") ?? "video";

  useEffect(() => {
    let cancelled = false;

    if (key) {
      fetch(`/api/vault/play?key=${encodeURIComponent(key)}`)
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error ?? "Failed to get playback URL");
          }
          return res.json();
        })
        .then(({ url }: { url: string }) => {
          if (!cancelled) {
            setMediaUrl(url);
            setLoading(false);
          }
        })
        .catch((err: Error) => {
          if (!cancelled) {
            setError(err.message);
            setLoading(false);
          }
        });
    } else if (directUrl) {
      setMediaUrl(directUrl);
      setLoading(false);
    } else {
      setError("No media specified");
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [key, directUrl]);

  if (loading) {
    return (
      <div className="watch-state">
        <Loader2 size={32} className="vault-play-spinner" />
        <p>Preparing playback…</p>
      </div>
    );
  }

  if (error || !mediaUrl) {
    return (
      <div className="watch-state watch-error">
        <p>{error ?? "Unable to load media"}</p>
        <button className="primary-btn" onClick={() => router.back()}>
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <PlyrPlayer
      url={mediaUrl}
      title={title}
      type={type}
      onClose={() => router.back()}
    />
  );
}

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <div className="watch-state">
          <Loader2 size={32} className="vault-play-spinner" />
          <p>Loading…</p>
        </div>
      }
    >
      <WatchContent />
    </Suspense>
  );
}
