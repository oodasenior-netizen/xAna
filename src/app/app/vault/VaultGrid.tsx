"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Lock, Unlock, Play } from "lucide-react";
import { unlockContent } from "@/app/actions";
import { MediaPlayer } from "@/components/MediaPlayer";
import type { StoredVaultItem } from "@/lib/store";

const PAGE_SIZE = 4;

const moodColors: Record<string, string> = {
  PPV: "#c9a84c",
  Exclusive: "#0b1a3b",
  Drop: "#2a3a5c",
  Live: "#d4a017",
  BTS: "#1a2d5a",
  Personal: "#2a3a5c",
};

function priceLabel(cents?: number) {
  if (!cents) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

type Props = {
  items: StoredVaultItem[];
  ownedContent: string[];
};

export function VaultGrid({ items, ownedContent }: Props) {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<"all" | "ppv" | "exclusive">("all");
  const [playerItem, setPlayerItem] = useState<StoredVaultItem | null>(null);

  const listedItems = items.filter((i) => i.status === "listed");

  const filtered =
    filter === "ppv"
      ? listedItems.filter((i) => i.access === "ppv")
      : filter === "exclusive"
      ? listedItems.filter((i) => i.access === "one-time" || i.access === "subscription")
      : listedItems;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function setFilterTab(f: typeof filter) {
    setFilter(f);
    setPage(0);
  }

  function isUnlocked(item: StoredVaultItem) {
    if (item.access === "subscription") return true;
    return ownedContent.includes(item.id);
  }

  const canPlay = (item: StoredVaultItem) =>
    isUnlocked(item) &&
    !!item.videoUrl &&
    (item.type === "video" || item.type === "audio");

  return (
    <>
      {/* Media Player Modal */}
      {playerItem && playerItem.videoUrl && (
        <MediaPlayer
          url={playerItem.videoUrl}
          title={playerItem.title}
          type={playerItem.type === "audio" ? "audio" : "video"}
          posterGradient={playerItem.thumb}
          onClose={() => setPlayerItem(null)}
        />
      )}

      {/* Filter tabs */}
      <div className="vault-filter-tabs">
        {(["all", "ppv", "exclusive"] as const).map((f) => (
          <button
            key={f}
            className={`vault-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilterTab(f)}
          >
            {f === "all" ? "All" : f === "ppv" ? "PPV" : "Exclusive"}
          </button>
        ))}
      </div>

      {/* Two-column grid */}
      <div className="vault-grid two-col">
        {pageItems.length === 0 && (
          <p style={{ gridColumn: "1/-1", color: "var(--ink-muted)", textAlign: "center", padding: "2rem 0" }}>
            Nothing here yet.
          </p>
        )}
        {pageItems.map((item) => {
          const unlocked = isUnlocked(item);
          const playable = canPlay(item);
          return (
            <article
              key={item.id}
              className={`vault-tile ${unlocked ? "vault-open" : "vault-locked"}`}
            >
              <div
                className="vault-tile-thumb"
                style={{ background: `linear-gradient(145deg, ${item.thumb[0]}, ${item.thumb[1]})` }}
              >
                {!unlocked && (
                  <span className="vault-lock-icon">
                    <Lock size={20} />
                  </span>
                )}
                {playable && (
                  <button
                    className="vault-play-btn"
                    onClick={() => setPlayerItem(item)}
                    aria-label={`Play ${item.title}`}
                  >
                    <Play size={26} />
                  </button>
                )}
                <span
                  className="vault-mood-badge"
                  style={{ background: moodColors[item.mood] ?? "var(--navy)" }}
                >
                  {item.mood}
                </span>
              </div>
              <div className="vault-tile-body">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <p className="vault-price">
                  {unlocked ? (
                    <>
                      <Unlock size={13} /> Owned
                    </>
                  ) : (
                    priceLabel(item.priceCents)
                  )}
                </p>
                {!unlocked ? (
                  <form action={unlockContent}>
                    <input type="hidden" name="contentId" value={item.id} />
                    <input type="hidden" name="nextPath" value="/app/vault" />
                    <button type="submit" className="primary-btn small-btn">
                      Uncork
                    </button>
                  </form>
                ) : playable ? (
                  <button
                    className="primary-btn small-btn"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => setPlayerItem(item)}
                  >
                    <Play size={13} /> Play Now
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="vault-pagination">
          <button
            className="vault-page-btn"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="vault-page-info">
            {page + 1} / {totalPages}
          </span>
          <button
            className="vault-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </>
  );
}
