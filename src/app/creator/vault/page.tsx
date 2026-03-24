"use client";

import { useState } from "react";
import type { MediaStatus, VaultMedia } from "@/lib/creator-data";
import { vaultMediaItems } from "@/lib/creator-data";

type FilterTab = "all" | MediaStatus;

type WizardField = {
  title: string;
  description: string;
  price: string;
  status: MediaStatus;
  scheduledFor: string;
};

export default function CreatorVaultPage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [items, setItems] = useState<VaultMedia[]>(vaultMediaItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [wizard, setWizard] = useState<WizardField>({
    title: "",
    description: "",
    price: "",
    status: "listed",
    scheduledFor: "",
  });
  const [saved, setSaved] = useState(false);

  const filtered = filter === "all" ? items : items.filter((m) => m.status === filter);
  const counts = {
    all: items.length,
    listed: items.filter((m) => m.status === "listed").length,
    unlisted: items.filter((m) => m.status === "unlisted").length,
    scheduled: items.filter((m) => m.status === "scheduled").length,
    stored: items.filter((m) => m.status === "stored").length,
  };

  function openWizard(item: VaultMedia) {
    setEditingId(item.id);
    setWizard({
      title: item.title,
      description: item.description,
      price: item.price.toString(),
      status: item.status,
      scheduledFor: item.scheduledFor ?? "",
    });
    setSaved(false);
  }

  function closeWizard() {
    setEditingId(null);
    setSaved(false);
  }

  function saveWizard() {
    setItems((prev) =>
      prev.map((m) =>
        m.id === editingId
          ? {
              ...m,
              title: wizard.title,
              description: wizard.description,
              price: parseFloat(wizard.price) || 0,
              status: wizard.status,
              scheduledFor: wizard.status === "scheduled" ? wizard.scheduledFor : undefined,
            }
          : m
      )
    );
    setSaved(true);
    setTimeout(() => closeWizard(), 800);
  }

  const statusIcon = (s: MediaStatus) => {
    if (s === "listed") return "🟢";
    if (s === "unlisted") return "🟡";
    if (s === "scheduled") return "🔵";
    return "⚪";
  };

  const typeIcon = (t: string) => {
    if (t === "video") return "🎬";
    if (t === "photo") return "📸";
    if (t === "audio") return "🎵";
    return "📦";
  };

  return (
    <section className="cr-page">
      <p className="eyebrow">Creator Vault</p>
      <h1 className="section-title">Media Manager</h1>

      {/* ── Status filter tabs ────────────────────────────── */}
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

      {/* ── Media grid ────────────────────────────────────── */}
      <div className="cr-vault-grid">
        {filtered.map((m) => (
          <div key={m.id} className="cr-vault-card">
            <div
              className="cr-vault-thumb"
              style={{
                background: `linear-gradient(135deg, ${m.thumb[0]}, ${m.thumb[1]})`,
              }}
            >
              <span className="cr-vault-type">{typeIcon(m.type)}</span>
              <span className="cr-vault-status-badge">{statusIcon(m.status)} {m.status}</span>
            </div>

            <div className="cr-vault-info">
              <h3 className="cr-vault-title">{m.title}</h3>
              <p className="cr-vault-desc">{m.description}</p>

              <div className="cr-vault-meta">
                <span>{m.fileSize}</span>
                <span>·</span>
                <span>{m.uploadedAt}</span>
              </div>

              {m.scheduledFor && (
                <div className="cr-vault-scheduled">
                  📅 Scheduled: {m.scheduledFor}
                </div>
              )}

              <div className="cr-vault-stats">
                <span>👁 {m.views.toLocaleString()}</span>
                <span>💰 {m.purchases} sales</span>
                <span>💵 ${m.revenue.toLocaleString()}</span>
              </div>

              <div className="cr-vault-price">
                {m.price > 0 ? `$${m.price.toFixed(2)}` : "Free / Archived"}
              </div>

              <button className="cr-vault-edit-btn" onClick={() => openWizard(m)}>
                ✏️ Quick Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Edit Wizard Modal ─────────────────────────────── */}
      {editingId && (
        <div className="cr-wizard-overlay" onClick={closeWizard}>
          <div className="cr-wizard" onClick={(e) => e.stopPropagation()}>
            <div className="cr-wizard-header">
              <h2>✏️ Quick Edit Wizard</h2>
              <button className="cr-wizard-close" onClick={closeWizard}>✕</button>
            </div>

            <div className="cr-wizard-body">
              <label className="cr-wizard-field">
                <span>Title</span>
                <input
                  type="text"
                  value={wizard.title}
                  onChange={(e) => setWizard({ ...wizard, title: e.target.value })}
                />
              </label>

              <label className="cr-wizard-field">
                <span>Description</span>
                <textarea
                  rows={3}
                  value={wizard.description}
                  onChange={(e) => setWizard({ ...wizard, description: e.target.value })}
                />
              </label>

              <div className="cr-wizard-row">
                <label className="cr-wizard-field half">
                  <span>Price ($)</span>
                  <input
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
                    value={wizard.status}
                    onChange={(e) => setWizard({ ...wizard, status: e.target.value as MediaStatus })}
                  >
                    <option value="listed">Listed</option>
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
                    type="text"
                    placeholder="e.g. Apr 1, 2026 9:00 AM"
                    value={wizard.scheduledFor}
                    onChange={(e) => setWizard({ ...wizard, scheduledFor: e.target.value })}
                  />
                </label>
              )}
            </div>

            <div className="cr-wizard-footer">
              <button className="secondary-btn small" onClick={closeWizard}>Cancel</button>
              <button className="primary-btn" onClick={saveWizard}>
                {saved ? "✓ Saved!" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
