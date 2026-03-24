"use client";

import { useState } from "react";

type Tab = "overview" | "breakdown" | "history";

const monthlyRevenue = [
  { month: "Oct", subs: 6200, ppv: 1400, tips: 800 },
  { month: "Nov", subs: 6800, ppv: 1600, tips: 800 },
  { month: "Dec", subs: 8200, ppv: 2400, tips: 1200 },
  { month: "Jan", subs: 9800, ppv: 3000, tips: 1400 },
  { month: "Feb", subs: 11600, ppv: 3600, tips: 1600 },
  { month: "Mar", subs: 12400, ppv: 4200, tips: 1800 },
];

const breakdown = [
  { source: "Subscriptions", amount: 12400, pct: 64, icon: "🌿" },
  { source: "PPV Sales", amount: 4200, pct: 22, icon: "🔒" },
  { source: "One-Time Sales", amount: 1800, pct: 9, icon: "🛍️" },
  { source: "Tips & Offerings", amount: 980, pct: 5, icon: "🪙" },
];

const transactions = [
  { id: "tx-001", type: "Subscription", user: "luna_dreams", amount: 14.0, date: "Today, 4:15 PM", plan: "El Jardín" },
  { id: "tx-002", type: "PPV Unlock", user: "velvet_rose", amount: 7.0, date: "Today, 3:52 PM", plan: "Velvet Night" },
  { id: "tx-003", type: "Tip — Fuego", user: "midnight_sky", amount: 50.0, date: "Today, 2:10 PM", plan: "🔥" },
  { id: "tx-004", type: "Subscription", user: "golden_dusk", amount: 35.0, date: "Today, 1:30 PM", plan: "El Salón" },
  { id: "tx-005", type: "One-Time", user: "amber_light", amount: 19.0, date: "Today, 11:45 AM", plan: "Print Collection" },
  { id: "tx-006", type: "Subscription", user: "terrace_nights", amount: 129.0, date: "Yesterday, 9:22 PM", plan: "La Alcoba" },
  { id: "tx-007", type: "PPV Unlock", user: "blossom_fan", amount: 12.0, date: "Yesterday, 7:00 PM", plan: "Moonlit Garden" },
  { id: "tx-008", type: "Tip — Vino", user: "sunset_watcher", amount: 15.0, date: "Yesterday, 5:18 PM", plan: "🍷" },
];

export default function RevenuePage() {
  const [tab, setTab] = useState<Tab>("overview");
  const maxTotal = Math.max(...monthlyRevenue.map((d) => d.subs + d.ppv + d.tips));

  return (
    <section className="cr-page">
      <p className="eyebrow">Revenue</p>
      <h1 className="section-title">Revenue Dashboard</h1>

      <div className="cr-tabs">
        {(["overview", "breakdown", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`cr-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ──────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="cr-section">
          <div className="cr-stat-grid">
            <div className="cr-stat-card accent">
              <span className="cr-stat-value">$19,380</span>
              <span className="cr-stat-label">This Month</span>
            </div>
            <div className="cr-stat-card">
              <span className="cr-stat-value">$16,800</span>
              <span className="cr-stat-label">Last Month</span>
            </div>
            <div className="cr-stat-card">
              <span className="cr-stat-value">+15.4%</span>
              <span className="cr-stat-label">Growth</span>
            </div>
            <div className="cr-stat-card">
              <span className="cr-stat-value">$82,400</span>
              <span className="cr-stat-label">Lifetime Earnings</span>
            </div>
          </div>

          <h2 className="cr-subtitle">Revenue by Month (Stacked)</h2>
          <div className="cr-bar-chart stacked">
            {monthlyRevenue.map((d) => {
              const total = d.subs + d.ppv + d.tips;
              return (
                <div key={d.month} className="cr-bar-col">
                  <div className="cr-bar-stack" style={{ height: `${(total / maxTotal) * 100}%` }}>
                    <div className="cr-stack-seg subs" style={{ flex: d.subs }} />
                    <div className="cr-stack-seg ppv" style={{ flex: d.ppv }} />
                    <div className="cr-stack-seg tips" style={{ flex: d.tips }} />
                  </div>
                  <span className="cr-bar-label">{d.month}</span>
                  <span className="cr-bar-value">${(total / 1000).toFixed(1)}k</span>
                </div>
              );
            })}
          </div>
          <div className="cr-legend">
            <span className="cr-legend-item"><span className="cr-dot subs" />Subs</span>
            <span className="cr-legend-item"><span className="cr-dot ppv" />PPV</span>
            <span className="cr-legend-item"><span className="cr-dot tips" />Tips</span>
          </div>
        </div>
      )}

      {/* ── BREAKDOWN ─────────────────────────────────────── */}
      {tab === "breakdown" && (
        <div className="cr-section">
          <h2 className="cr-subtitle">Revenue Sources</h2>
          <div className="cr-breakdown-ring">
            <div className="cr-ring-visual">
              <svg viewBox="0 0 120 120" className="cr-ring-svg">
                {(() => {
                  let offset = 0;
                  const colors = ["var(--accent)", "var(--accent-gold)", "var(--blossom)", "var(--terracotta)"];
                  return breakdown.map((src, i) => {
                    const dash = (src.pct / 100) * 339.292;
                    const gap = 339.292 - dash;
                    const el = (
                      <circle
                        key={src.source}
                        cx="60" cy="60" r="54"
                        fill="none"
                        stroke={colors[i]}
                        strokeWidth="10"
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="round"
                      />
                    );
                    offset += dash;
                    return el;
                  });
                })()}
              </svg>
              <div className="cr-ring-center">
                <span className="cr-ring-total">$19,380</span>
                <span className="cr-ring-label">Total</span>
              </div>
            </div>
            <div className="cr-breakdown-list">
              {breakdown.map((src) => (
                <div key={src.source} className="cr-breakdown-row">
                  <span className="cr-breakdown-icon">{src.icon}</span>
                  <span className="cr-breakdown-name">{src.source}</span>
                  <span className="cr-breakdown-amount">${src.amount.toLocaleString()}</span>
                  <span className="cr-breakdown-pct">{src.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <h2 className="cr-subtitle" style={{ marginTop: "1.5rem" }}>Revenue per Tier</h2>
          <div className="cr-stat-grid cols-3">
            <div className="cr-stat-card">
              <span className="cr-stat-value">$7,448</span>
              <span className="cr-stat-label">El Jardín (2,520)</span>
            </div>
            <div className="cr-stat-card">
              <span className="cr-stat-value">$6,580</span>
              <span className="cr-stat-label">El Salón (1,176)</span>
            </div>
            <div className="cr-stat-card">
              <span className="cr-stat-value">$5,352</span>
              <span className="cr-stat-label">La Alcoba (504)</span>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY ───────────────────────────────────────── */}
      {tab === "history" && (
        <div className="cr-section">
          <h2 className="cr-subtitle">Recent Transactions</h2>
          <div className="cr-table">
            <div className="cr-table-header four-col">
              <span>Type</span>
              <span>User</span>
              <span>Amount</span>
              <span>When</span>
            </div>
            {transactions.map((tx) => (
              <div key={tx.id} className="cr-table-row four-col">
                <span className="cr-table-type">{tx.type}</span>
                <span className="cr-table-user">@{tx.user}</span>
                <span className="cr-table-revenue">${tx.amount.toFixed(2)}</span>
                <span className="cr-table-date">{tx.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
