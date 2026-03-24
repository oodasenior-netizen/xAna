"use client";

import { useState } from "react";

const initialBlocked = [
  { id: "blk-001", username: "toxic_troll_99", reason: "Harassment in comments", blockedAt: "Mar 18, 2026" },
  { id: "blk-002", username: "spam_bot_42", reason: "Spam messages", blockedAt: "Mar 10, 2026" },
];

const reportQueue = [
  { id: "rpt-001", reporter: "luna_dreams", target: "shadow_lurker", reason: "Inappropriate comments", date: "Today, 1:30 PM" },
  { id: "rpt-002", reporter: "velvet_rose", target: "anon_998", reason: "Unsolicited DMs", date: "Yesterday, 4:15 PM" },
  { id: "rpt-003", reporter: "golden_dusk", target: "creep_acct", reason: "Impersonation attempt", date: "Mar 21, 11:00 AM" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<"overview" | "reports" | "blocked" | "settings">("overview");
  const [blocked, setBlocked] = useState(initialBlocked);
  const [reports, setReports] = useState(reportQueue);
  const [blockInput, setBlockInput] = useState({ username: "", reason: "" });
  const [blockSuccess, setBlockSuccess] = useState(false);

  function blockUser() {
    if (!blockInput.username.trim() || !blockInput.reason.trim()) return;
    setBlocked((prev) => [
      { id: `blk-${Date.now()}`, username: blockInput.username, reason: blockInput.reason, blockedAt: "Just now" },
      ...prev,
    ]);
    setBlockInput({ username: "", reason: "" });
    setBlockSuccess(true);
    setTimeout(() => setBlockSuccess(false), 1500);
  }

  function unblock(id: string) {
    setBlocked((prev) => prev.filter((b) => b.id !== id));
  }

  function resolveReport(id: string) {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  function blockFromReport(report: typeof reportQueue[0]) {
    setBlocked((prev) => [
      { id: `blk-${Date.now()}`, username: report.target, reason: report.reason, blockedAt: "Just now" },
      ...prev,
    ]);
    resolveReport(report.id);
  }

  return (
    <section className="cr-page">
      <p className="eyebrow">Admin Panel</p>
      <h1 className="section-title">Security &amp; Management</h1>

      <div className="cr-tabs">
        {(["overview", "reports", "blocked", "settings"] as const).map((t) => (
          <button key={t} className={`cr-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "overview" ? "📊 Overview" : t === "reports" ? `🚨 Reports (${reports.length})` : t === "blocked" ? `🚫 Blocked (${blocked.length})` : "⚙️ Settings"}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ──────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="cr-section">
          <div className="cr-stat-grid">
            {[
              ["4,200", "Total Subscribers"],
              ["1,842", "Active Today"],
              ["168", "New This Week"],
              ["2.1%", "Churn Rate"],
            ].map(([val, label]) => (
              <div key={label} className="cr-stat-card">
                <span className="cr-stat-value">{val}</span>
                <span className="cr-stat-label">{label}</span>
              </div>
            ))}
          </div>

          <div className="cr-stat-grid cols-3" style={{ marginTop: "1rem" }}>
            {[
              ["0", "Flagged Content"],
              [String(reports.length), "Pending Reports"],
              [String(blocked.length), "Blocked Accounts"],
            ].map(([val, label]) => (
              <div key={label} className="cr-stat-card">
                <span className="cr-stat-value">{val}</span>
                <span className="cr-stat-label">{label}</span>
              </div>
            ))}
          </div>

          <h2 className="cr-subtitle" style={{ marginTop: "1.5rem" }}>Storage</h2>
          <div className="cr-storage-bar">
            <div className="cr-storage-track">
              <div className="cr-storage-fill" style={{ width: "77.2%" }} />
            </div>
            <span className="cr-storage-label">386 GB / 500 GB used</span>
          </div>
        </div>
      )}

      {/* ── REPORTS ───────────────────────────────────────── */}
      {tab === "reports" && (
        <div className="cr-section">
          {reports.length === 0 ? (
            <div className="cr-empty">
              <span>✅</span>
              <p>No pending reports</p>
            </div>
          ) : (
            <div className="cr-report-list">
              {reports.map((r) => (
                <div key={r.id} className="cr-report-card">
                  <div className="cr-report-header">
                    <span className="cr-report-target">@{r.target}</span>
                    <span className="timestamp">{r.date}</span>
                  </div>
                  <p className="cr-report-reason">
                    <strong>Reason:</strong> {r.reason}
                  </p>
                  <p className="cr-report-by">Reported by @{r.reporter}</p>
                  <div className="cr-report-actions">
                    <button className="primary-btn small" onClick={() => blockFromReport(r)}>
                      🚫 Block User
                    </button>
                    <button className="secondary-btn small" onClick={() => resolveReport(r.id)}>
                      ✓ Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── BLOCKED ───────────────────────────────────────── */}
      {tab === "blocked" && (
        <div className="cr-section">
          <div className="cr-block-form">
            <h2 className="cr-subtitle">Block a User</h2>
            <div className="cr-wizard-row">
              <label className="cr-wizard-field half">
                <span>Username</span>
                <input
                  type="text"
                  placeholder="@username"
                  value={blockInput.username}
                  onChange={(e) => setBlockInput({ ...blockInput, username: e.target.value })}
                />
              </label>
              <label className="cr-wizard-field half">
                <span>Reason</span>
                <input
                  type="text"
                  placeholder="Reason for blocking"
                  value={blockInput.reason}
                  onChange={(e) => setBlockInput({ ...blockInput, reason: e.target.value })}
                />
              </label>
            </div>
            <button className="primary-btn" onClick={blockUser}>
              {blockSuccess ? "✓ Blocked!" : "🚫 Block User"}
            </button>
          </div>

          <h2 className="cr-subtitle" style={{ marginTop: "1.5rem" }}>Blocked Users</h2>
          {blocked.length === 0 ? (
            <p className="cr-muted">No blocked users</p>
          ) : (
            <div className="cr-blocked-list">
              {blocked.map((b) => (
                <div key={b.id} className="cr-blocked-row">
                  <div>
                    <strong>@{b.username}</strong>
                    <span className="cr-blocked-reason">{b.reason}</span>
                    <span className="timestamp">{b.blockedAt}</span>
                  </div>
                  <button className="secondary-btn small" onClick={() => unblock(b.id)}>
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SETTINGS ──────────────────────────────────────── */}
      {tab === "settings" && (
        <div className="cr-section">
          <h2 className="cr-subtitle">Security Controls</h2>
          <div className="cr-admin-settings">
            {[
              ["Rotate Signing Secret", "Regenerate the HMAC secret used for session tokens"],
              ["Two-Factor Authentication", "Require 2FA for creator login"],
              ["IP Allowlist", "Restrict creator dashboard access to specific IPs"],
              ["Session Timeout", "Auto-logout after inactivity period"],
            ].map(([title, desc]) => (
              <div key={title} className="cr-admin-setting-row">
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                <button className="secondary-btn small" disabled>Configure</button>
              </div>
            ))}
          </div>

          <h2 className="cr-subtitle" style={{ marginTop: "1.5rem" }}>Plan Pricing</h2>
          <div className="cr-pricing-editor">
            {[
              { plan: "El Jardín", price: "$14/mo", subs: "2,520" },
              { plan: "El Salón", price: "$35/3mo", subs: "1,176" },
              { plan: "La Alcoba", price: "$129/yr", subs: "504" },
            ].map((p) => (
              <div key={p.plan} className="cr-pricing-row">
                <span className="cr-pricing-plan">{p.plan}</span>
                <span className="cr-pricing-price">{p.price}</span>
                <span className="cr-pricing-subs">{p.subs} subs</span>
                <button className="secondary-btn small" disabled>Edit</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
