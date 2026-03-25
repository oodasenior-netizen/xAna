"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, RefreshCw, X } from "lucide-react";
import type { StoredVaultItem } from "@/lib/store";
import { PlyrPlayer } from "@/components/PlyrPlayer";

type Props = {
  item: StoredVaultItem | null;
  onClose: () => void;
};

export default function MediaPlayerModal({ item, onClose }: Props) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaType = useMemo<"video" | "audio" | "photo">(() => {
    if (!item) return "video";
    if (item.type === "audio") return "audio";
    if (item.type === "photo") return "photo";
    return "video";
  }, [item]);

  async function resolveMediaUrl(target: StoredVaultItem) {
    setLoading(true);
    setError(null);
    setResolvedUrl(null);

    try {
      if (target.storageKey) {
        const res = await fetch(`/api/vault/play?key=${encodeURIComponent(target.storageKey)}`);
        const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!res.ok || !json.url) {
          throw new Error(json.error ?? "Unable to resolve media URL");
        }
        setResolvedUrl(json.url);
        return;
      }

      if (target.videoUrl) {
        setResolvedUrl(target.videoUrl);
        return;
      }

      throw new Error("No playable media URL available for this item");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Playback unavailable";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!item) {
      setResolvedUrl(null);
      setLoading(false);
      setError(null);
      return;
    }
    void resolveMediaUrl(item);
  }, [item]);

  if (!item) return null;

  if (loading) {
    return (
      <div className="mpm-overlay" role="dialog" aria-modal="true" aria-label="Loading media">
        <div className="mpm-state-card">
          <Loader2 size={28} className="vault-play-spinner" />
          <p>Loading media...</p>
          <button type="button" className="secondary-btn small" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  }

  if (error || !resolvedUrl) {
    return (
      <div className="mpm-overlay" role="dialog" aria-modal="true" aria-label="Playback error">
        <div className="mpm-state-card mpm-state-card--error">
          <AlertCircle size={26} />
          <p>{error ?? "Unable to load media"}</p>
          <div className="mpm-actions">
            <button type="button" className="primary-btn small" onClick={() => void resolveMediaUrl(item)}>
              <RefreshCw size={14} /> Retry
            </button>
            <button type="button" className="secondary-btn small" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (mediaType === "photo") {
    return (
      <div className="mpm-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={item.title}>
        <div className="mpm-image-shell" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="mpm-close" onClick={onClose} aria-label="Close viewer">
            <X size={18} />
          </button>
          <img src={resolvedUrl} alt={item.title} className="mpm-image" />
          <div className="mpm-caption">{item.title}</div>
        </div>
      </div>
    );
  }

  return (
    <PlyrPlayer
      url={resolvedUrl}
      title={item.title}
      type={mediaType === "audio" ? "audio" : "video"}
      onClose={onClose}
    />
  );
}
