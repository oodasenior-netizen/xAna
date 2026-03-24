"use client";

import { useState } from "react";
import { unlockContent } from "@/app/actions";
import { vaultItems } from "@/lib/content";
import { ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react";

const PAGE_SIZE = 4;

// Mood tag color mapping
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

function canAccess(item: { access: string }) {
  // In subscriber view, subscription items are always unlocked
  return item.access === "subscription";
}

export default function BodegaPage() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<"all" | "ppv" | "exclusive">("all");

  const filtered =
    filter === "ppv"
      ? vaultItems.filter((i) => i.access === "ppv")
      : filter === "exclusive"
      ? vaultItems.filter((i) => i.access === "one-time" || i.access === "subscription")
      : vaultItems;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function setFilterTab(f: typeof filter) {
    setFilter(f);
    setPage(0);
  }

  return (
    <section className="vault-page">
      <h1 className="section-title">La Bodega</h1>
      <p className="vault-intro">Private reserves — curated, aged to perfection.</p>

      {/* ── Filter tabs ────────────────────────────────── */}
      <div className="vault-filter-tabs">
        <button
          className={`vault-filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilterTab("all")}
        >
          All
        </button>
        <button
          className={`vault-filter-btn ${filter === "ppv" ? "active" : ""}`}
          onClick={() => setFilterTab("ppv")}
        >
          PPV
        </button>
        <button
          className={`vault-filter-btn ${filter === "exclusive" ? "active" : ""}`}
          onClick={() => setFilterTab("exclusive")}
        >
          Exclusive
        </button>
      </div>

      {/* ── Two-block grid ─────────────────────────────── */}
      <div className="vault-grid two-col">
        {pageItems.map((item) => {
          const unlocked = canAccess(item);
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
                  <span className="vault-lock-icon"><Lock size={20} /></span>
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
                    <><Unlock size={13} /> Owned</>
                  ) : (
                    priceLabel(item.priceCents)
                  )}
                </p>
                {!unlocked && (
                  <form action={unlockContent}>
                    <input type="hidden" name="contentId" value={item.id} />
                    <input type="hidden" name="nextPath" value="/app/vault" />
                    <button type="submit" className="primary-btn small-btn">Uncork</button>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Pagination ─────────────────────────────────── */}
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
    </section>
  );
}

