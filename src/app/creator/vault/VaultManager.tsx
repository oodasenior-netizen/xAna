"use client";

import { useState } from "react";
import {
  creatorUpdateVaultItem,
  creatorDeleteVaultItem,
  creatorPublishVaultItem,
} from "@/app/actions";
import type { StoredVaultItem, MediaStatus } from "@/lib/store";

type FilterTab = "all" | MediaStatus;

type WizardState = {
  id: string;
  title: string;
  description: string;
  price: string;
  status: MediaStatus;
  scheduledFor: string;
  videoUrl: string;
};

const EMPTY_WIZARD: WizardState = {
  id: "",
  title: "",
  description: "",
  price: "",
  status: "listed",
  scheduledFor: "",
  videoUrl: "",
};

const statusIcon = (s: MediaStatus) => {
  if (s === "listed") return "🟢";
  if (s === "unlisted") return "🟡";
  if (s === "scheduled") return "🔵";
  return "⚪";
};

const typeIcon = (t?: string) => {
  if (t === "video") return "🎬";
  if (t === "photo") return "📸";
  if (t === "audio") return "🎵";
  return "📦";
};

type Props = {
  items: StoredVaultItem[];
  published?: boolean;
  saved?: boolean;
  error?: boolean;
};

export default function VaultManager({ items, published, saved, error }: Props) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [wizard, setWizard] = useState<WizardState>(EMPTY_WIZARD);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const filtered = filter === "all" ? items : items.filter((m) => m.status === filter);
  const counts: Record<FilterTab, number> = {
    all: items.length,
    listed: items.filter((m) => m.status === "listed").length,
    unlisted: items.filter((m) => m.status === "unlisted").length,
    scheduled: items.filter((m) => m.status === "scheduled").length,
    stored: items.filter((m) => m.status === "stored").length,
  };

  function openWizard(item: StoredVaultItem) {
    setWizard({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.priceCents ? (item.priceCents / 100).toFixed(2) : "",
      status: item.status,
      scheduledFor: item.scheduledFor ?? "",
      videoUrl: item.videoUrl ?? "",
    });
    setWizardOpen(true);
  }

  return (
    <div>
      {/* Toast messages */}
      {published && (
        <div className="cr-toast cr-toast-success">✓ Item added to subscriber vault</div>
      )}
      {saved && (
        <div className="cr-toast cr-toast-success">✓ Changes saved successfully</div>
      )}
      {error && (
        <div className="cr-toast cr-toast-error">Title is required.</div>
      )}

      {/* Add New Item toggle */}
      <div style={{ marginBottom: "1rem" }}>
        <button className="primary-btn" onClick={() => setAddOpen((v) => !v)}>
          {addOpen ? "✕ Cancel" : "＋ Add New Item"}
        </button>
      </div>

      {/* Add New Item Form */}
      {addOpen && (
        <div className="cr-compose" style={{ marginBottom: "1.5rem" }}>
          <form
            action={async (fd) => {
              setPending(true);
              await creatorPublishVaultItem(fd);
              setPending(false);
            }}
          >
            <div className="cr-wizard-row">
              <label className="cr-wizard-field half">
                <span>Title *</span>
                <input name="title" type="text" placeholder="Item title" required />
              </label>
              <label className="cr-wizard-field half">
                <span>Price ($)</span>
                <input name="price" type="number" min="0" step="0.01" placeholder="0.00" />
              </label>
            </div>

            <label className="cr-wizard-field">
              <span>Description</span>
              <textarea name="description" rows={3} placeholder="Describe this item…" />
            </label>

            <div className="cr-wizard-row">
              <label className="cr-wizard-field half">
                <span>Access</span>
                <select name="access" defaultValue="ppv">
                  <option value="ppv">PPV</option>
                  <option value="one-time">One-Time Purchase</option>
                  <option value="subscription">Subscription</option>
                </select>
              </label>
              <label className="cr-wizard-field half">
                <span>Mood</span>
                <select name="mood" defaultValue="PPV">
                  <option value="PPV">PPV</option>
                  <option value="Exclusive">Exclusive</option>
                  <option value="Drop">Drop</option>
                  <option value="Live">Live</option>
                  <option value="BTS">BTS</option>
                  <option value="Personal">Personal</option>
                </select>
              </label>
            </div>

            <div className="cr-wizard-row">
              <label className="cr-wizard-field half">
                <span>Media Type</span>
                <select name="mediaType" defaultValue="video">
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="photo">Photo</option>
                  <option value="bundle">Bundle</option>
                </select>
              </label>
              <label className="cr-wizard-field half">
                <span>Initial Status</span>
                <select name="status" defaultValue="listed">
                  <option value="listed">Listed (Visible)</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="stored">Stored</option>
                </select>
              </label>
            </div>

            <label className="cr-wizard-field">
              <span>Video / Audio URL</span>
              <input name="videoUrl" type="url" placeholder="https://… direct link to your media file" />
            </label>

            <div className="cr-compose-actions">
              <button type="button" className="secondary-btn small" onClick={() => setAddOpen(false)}>Cancel</button>
              <button type="submit" className="primary-btn" disabled={pending}>
                {pending ? "Publishing…" : "🚀 Publish to Vault"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="cr-tabs">
        {(["all", "listed", "unlisted", "scheduled", "stored"] as FilterTab[]).map((t) => (
          <button
            key={t}
            className={`cr-tab ${filter === t ? "active" : ""}`}
            onClick={() => setFilter(t)}
          >
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}{" "}
            <span className="cr-tab-count">{counts[t]}</span>
          </button>
        ))}
      </div>

      {/* Media grid */}
      <div className="cr-vault-grid">
        {filtered.length === 0 && (
          <p style={{ color: "var(--ink-muted)", padding: "1rem 0" }}>No items in this category.</p>
        )}
        {filtered.map((m) => (
          <div key={m.id} className="cr-vault-card">
            <div
              className="cr-vault-thumb"
              style={{ background: `linear-gradient(135deg, ${m.thumb[0]}, ${m.thumb[1]})` }}
            >
              <span className="cr-vault-type">{typeIcon(m.type)}</span>
              <span className="cr-vault-status-badge">
                {statusIcon(m.status)} {m.status}
              </span>
            </div>

            <div className="cr-vault-info">
              <h3 className="cr-vault-title">{m.title}</h3>
              <p className="cr-vault-desc">{m.description}</p>

              <div className="cr-vault-meta">
                {m.fileSize && <><span>{m.fileSize}</span><span>·</span></>}
                <span>{m.uploadedAt ?? "—"}</span>
              </div>

              {m.scheduledFor && (
                <div className="cr-vault-scheduled">📅 Scheduled: {m.scheduledFor}</div>
              )}

              <div className="cr-vault-stats">
                <span>👁 {(m.views ?? 0).toLocaleString()}</span>
                <span>💰 {(m.purchases ?? 0)} sales</span>
              </div>

              <div className="cr-vault-price">
                {m.priceCents ? `$${(m.priceCents / 100).toFixed(2)}` : "Free / Archived"}
              </div>

              {m.videoUrl && (
                <a
                  href={m.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="cr-feed-media-link"
                  style={{ display: "inline-block", marginBottom: "0.5rem" }}
                >
                  🎬 Preview media
                </a>
              )}

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button className="cr-vault-edit-btn" onClick={() => openWizard(m)}>
                  ✏️ Quick Edit
                </button>
                <form action={creatorDeleteVaultItem}>
                  <input type="hidden" name="itemId" value={m.id} />
                  <button type="submit" className="cr-delete-btn">🗑</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Wizard Modal */}
      {wizardOpen && (
        <div className="cr-wizard-overlay" onClick={() => setWizardOpen(false)}>
          <div className="cr-wizard" onClick={(e) => e.stopPropagation()}>
            <div className="cr-wizard-header">
              <h2>✏️ Quick Edit</h2>
              <button className="cr-wizard-close" onClick={() => setWizardOpen(false)}>✕</button>
            </div>

            <form
              className="cr-wizard-body"
              action={async (fd) => {
                setPending(true);
                await creatorUpdateVaultItem(fd);
                setPending(false);
                setWizardOpen(false);
              }}
            >
              <input type="hidden" name="id" value={wizard.id} />

              <label className="cr-wizard-field">
                <span>Title</span>
                <input
                  name="title"
                  type="text"
                  value={wizard.title}
                  onChange={(e) => setWizard({ ...wizard, title: e.target.value })}
                />
              </label>

              <label className="cr-wizard-field">
                <span>Description</span>
                <textarea
                  name="description"
                  rows={3}
                  value={wizard.description}
                  onChange={(e) => setWizard({ ...wizard, description: e.target.value })}
                />
              </label>

              <div className="cr-wizard-row">
                <label className="cr-wizard-field half">
                  <span>Price ($)</span>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={wizard.price}
                    onChange={(e) => setWizard({ ...wizard, price: e.target.value })}
                  />
                </label>

                <label className="cr-wizard-field half">
                  <span>Status</span>
                  <select
                    name="status"
                    value={wizard.status}
                    onChange={(e) => setWizard({ ...wizard, status: e.target.value as MediaStatus })}
                  >
                    <option value="listed">Listed (Visible)</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="stored">Stored</option>
                  </select>
                </label>
              </div>

              {wizard.status === "scheduled" && (
                <label className="cr-wizard-field">
                  <span>Release Date</span>
                  <input
                    name="scheduledFor"
                    type="text"
                    placeholder="e.g. Apr 1, 2026 9:00 AM"
                    value={wizard.scheduledFor}
                    onChange={(e) => setWizard({ ...wizard, scheduledFor: e.target.value })}
                  />
                </label>
              )}

              <label className="cr-wizard-field">
                <span>Video / Audio URL</span>
                <input
                  name="videoUrl"
                  type="url"
                  placeholder="https://… direct link"
                  value={wizard.videoUrl}
                  onChange={(e) => setWizard({ ...wizard, videoUrl: e.target.value })}
                />
              </label>

              <div className="cr-wizard-footer">
                <button type="button" className="secondary-btn small" onClick={() => setWizardOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={pending}>
                  {pending ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
