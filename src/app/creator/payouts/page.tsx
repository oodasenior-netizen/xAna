"use client";

import { useState } from "react";

const payoutHistory = [
  { id: "po-001", date: "Mar 15, 2026", amount: 4200.0, status: "completed" as const, method: "Direct Deposit" },
  { id: "po-002", date: "Mar 1, 2026", amount: 3850.0, status: "completed" as const, method: "Direct Deposit" },
  { id: "po-003", date: "Feb 15, 2026", amount: 3600.0, status: "completed" as const, method: "Direct Deposit" },
  { id: "po-004", date: "Feb 1, 2026", amount: 3200.0, status: "completed" as const, method: "Wire Transfer" },
  { id: "po-005", date: "Jan 15, 2026", amount: 2900.0, status: "completed" as const, method: "Wire Transfer" },
  { id: "po-006", date: "Jan 1, 2026", amount: 2650.0, status: "completed" as const, method: "Wire Transfer" },
];

export default function PayoutsPage() {
  const [tab, setTab] = useState<"balance" | "history" | "settings">("balance");
  const [requestSent, setRequestSent] = useState(false);

  function requestPayout() {
    setRequestSent(true);
    setTimeout(() => setRequestSent(false), 2000);
  }

  return (
    <section className="cr-page">
      <p className="eyebrow">Payouts</p>
      <h1 className="section-title">Earnings &amp; Payouts</h1>

      <div className="cr-tabs">
        {(["balance", "history", "settings"] as const).map((t) => (
          <button key={t} className={`cr-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "balance" ? "💰 Balance" : t === "history" ? "📋 History" : "⚙️ Settings"}
          </button>
        ))}
      </div>

      {/* ── BALANCE ───────────────────────────────────────── */}
      {tab === "balance" && (
        <div className="cr-section">
          <div className="cr-balance-hero">
            <div className="cr-balance-card main">
              <span className="cr-balance-label">Available Balance</span>
              <span className="cr-balance-amount">$2,480.00</span>
              <button className="primary-btn" onClick={requestPayout}>
                {requestSent ? "✓ Payout Requested!" : "Request Payout"}
              </button>
            </div>
          </div>

          <div className="cr-stat-grid">
            <div className="cr-stat-card">
              <span className="cr-stat-value">$1,260</span>
              <span className="cr-stat-label">Pending</span>
            </div>
            <div className="cr-stat-card">
              <span className="cr-stat-value">$82,400</span>
              <span className="cr-stat-label">Lifetime Earnings</span>
            </div>
            <div className="cr-stat-card">
              <span className="cr-stat-value">Apr 1</span>
              <span className="cr-stat-label">Next Payout</span>
            </div>
            <div className="cr-stat-card">
              <span className="cr-stat-value">$19,380</span>
              <span className="cr-stat-label">This Month</span>
            </div>
          </div>

          <h2 className="cr-subtitle" style={{ marginTop: "1.5rem" }}>Earnings Breakdown — This Month</h2>
          <div className="cr-payout-breakdown">
            {[
              { source: "Subscriptions", amount: 12400, icon: "🌿" },
              { source: "PPV Sales", amount: 4200, icon: "🔒" },
              { source: "One-Time Sales", amount: 1800, icon: "🛍️" },
              { source: "Tips", amount: 980, icon: "🪙" },
            ].map((s) => (
              <div key={s.source} className="cr-payout-source">
                <span>{s.icon}</span>
                <span>{s.source}</span>
                <span className="cr-payout-source-amount">${s.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HISTORY ───────────────────────────────────────── */}
      {tab === "history" && (
        <div className="cr-section">
          <h2 className="cr-subtitle">Payout History</h2>
          <div className="cr-table">
            <div className="cr-table-header four-col">
              <span>Date</span>
              <span>Amount</span>
              <span>Method</span>
              <span>Status</span>
            </div>
            {payoutHistory.map((p) => (
              <div key={p.id} className="cr-table-row four-col">
                <span>{p.date}</span>
                <span className="cr-table-revenue">${p.amount.toFixed(2)}</span>
                <span>{p.method}</span>
                <span className="cr-payout-status completed">✓ {p.status}</span>
              </div>
            ))}
          </div>

          <div className="cr-stat-grid cols-2" style={{ marginTop: "1.5rem" }}>
            <div className="cr-stat-card">
              <span className="cr-stat-value">$20,400</span>
              <span className="cr-stat-label">Total Paid Out (6 mo)</span>
            </div>
            <div className="cr-stat-card">
              <span className="cr-stat-value">6</span>
              <span className="cr-stat-label">Payouts Completed</span>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS ──────────────────────────────────────── */}
      {tab === "settings" && (
        <div className="cr-section">
          <h2 className="cr-subtitle">Payout Method</h2>
          <div className="cr-admin-settings">
            <div className="cr-admin-setting-row">
              <div>
                <h3>Direct Deposit</h3>
                <p>Wells Fargo •••• 4821 — Routing •••• 7200</p>
              </div>
              <span className="cr-payout-status completed">✓ Active</span>
            </div>
            <div className="cr-admin-setting-row">
              <div>
                <h3>PayPal</h3>
                <p>ari@voss.studio</p>
              </div>
              <span className="cr-payout-status pending">Backup</span>
            </div>
          </div>

          <h2 className="cr-subtitle" style={{ marginTop: "1.5rem" }}>Payout Schedule</h2>
          <div className="cr-admin-settings">
            <div className="cr-admin-setting-row">
              <div>
                <h3>Frequency</h3>
                <p>Bi-weekly (1st and 15th of each month)</p>
              </div>
              <button className="secondary-btn small" disabled>Change</button>
            </div>
            <div className="cr-admin-setting-row">
              <div>
                <h3>Minimum Payout</h3>
                <p>$100.00</p>
              </div>
              <button className="secondary-btn small" disabled>Change</button>
            </div>
          </div>

          <h2 className="cr-subtitle" style={{ marginTop: "1.5rem" }}>Tax Information</h2>
          <div className="cr-admin-settings">
            <div className="cr-admin-setting-row">
              <div>
                <h3>W-9 Status</h3>
                <p>Submitted and verified</p>
              </div>
              <span className="cr-payout-status completed">✓ Verified</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
