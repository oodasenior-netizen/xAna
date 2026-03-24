"use client";

import { useState } from "react";

type Tab = "overview" | "engagement" | "content" | "growth";

const weeklyViews = [
  { day: "Mon", views: 1240 },
  { day: "Tue", views: 1580 },
  { day: "Wed", views: 1390 },
  { day: "Thu", views: 2100 },
  { day: "Fri", views: 2840 },
  { day: "Sat", views: 3200 },
  { day: "Sun", views: 2650 },
];

const monthlyRevenue = [
  { month: "Oct", amount: 8400 },
  { month: "Nov", amount: 9200 },
  { month: "Dec", amount: 11800 },
  { month: "Jan", amount: 14200 },
  { month: "Feb", amount: 16800 },
  { month: "Mar", amount: 19400 },
];

const topContent = [
  { title: "La Siesta Film Pack", revenue: 6675, purchases: 267 },
  { title: "Hacienda Print Collection", revenue: 2546, purchases: 134 },
  { title: "Velvet Night (Director Cut)", revenue: 1323, purchases: 189 },
  { title: "Orange Blossom Collection", revenue: 1845, purchases: 123 },
  { title: "Moonlit Garden Session", revenue: 1560, purchases: 130 },
];

const subscriberGrowth = [
  { month: "Oct", subs: 2800 },
  { month: "Nov", subs: 3100 },
  { month: "Dec", subs: 3400 },
  { month: "Jan", subs: 3700 },
  { month: "Feb", subs: 3950 },
  { month: "Mar", subs: 4200 },
];

const tierBreakdown = [
  { label: "El Jardín", count: 2520, pct: 60, color: "var(--accent)" },
  { label: "El Salón", count: 1176, pct: 28, color: "var(--accent-gold)" },
  { label: "La Alcoba", count: 504, pct: 12, color: "var(--blossom)" },
];

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const maxViews = Math.max(...weeklyViews.map((d) => d.views));
  const maxRev = Math.max(...monthlyRevenue.map((d) => d.amount));
  const maxSubs = Math.max(...subscriberGrowth.map((d) => d.subs));

  return (
    <section className="cr-page">
      <p className="eyebrow">Analytics</p>
      <h1 className="section-title">Performance Dashboard</h1>

      <div className="cr-tabs">
        {(["overview", "engagement", "content", "growth"] as Tab[]).map((t) => (
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
              <span className="cr-stat-value">4,200</span>
              <span className="cr-stat-label">Total Subscribers</span>
            </div>
            <div className="cr-stat-card">
              <span className="cr-stat-value">$19,380</span>
              <span className="cr-stat-label">Monthly Revenue</span>
            </div>
            <div className="cr-stat-card">
              <span className="cr-stat-value">15,000</span>
              <span className="cr-stat-label">Weekly Views</span>
            </div>
            <div className="cr-stat-card">
              <span className="cr-stat-value">81%</span>
              <span className="cr-stat-label">Inbox Open Rate</span>
            </div>
          </div>

          <h2 className="cr-subtitle">Weekly Views</h2>
          <div className="cr-bar-chart">
            {weeklyViews.map((d) => (
              <div key={d.day} className="cr-bar-col">
                <div className="cr-bar" style={{ height: `${(d.views / maxViews) * 100}%` }} />
                <span className="cr-bar-label">{d.day}</span>
                <span className="cr-bar-value">{d.views.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <h2 className="cr-subtitle">Revenue Trend (6 mo)</h2>
          <div className="cr-bar-chart">
            {monthlyRevenue.map((d) => (
              <div key={d.month} className="cr-bar-col">
                <div className="cr-bar gold" style={{ height: `${(d.amount / maxRev) * 100}%` }} />
                <span className="cr-bar-label">{d.month}</span>
                <span className="cr-bar-value">${(d.amount / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ENGAGEMENT ────────────────────────────────────── */}
      {tab === "engagement" && (
        <div className="cr-section">
          <div className="cr-stat-grid cols-3">
            {[
              ["6m 42s", "Avg. Watch Time"],
              ["72%", "Feed Completion"],
              ["81%", "Inbox Open Rate"],
              ["342", "Live Avg. Viewers"],
              ["14.2%", "Tip Conversion"],
              ["68%", "Return Rate (30d)"],
            ].map(([val, label]) => (
              <div key={label} className="cr-stat-card">
                <span className="cr-stat-value">{val}</span>
                <span className="cr-stat-label">{label}</span>
              </div>
            ))}
          </div>

          <h2 className="cr-subtitle">Peak Hours Heatmap</h2>
          <div className="cr-heatmap">
            {["6AM", "9AM", "12PM", "3PM", "6PM", "9PM", "12AM"].map((hr, i) => {
              const intensity = [0.2, 0.3, 0.5, 0.65, 0.85, 1.0, 0.6][i];
              return (
                <div key={hr} className="cr-heat-cell" style={{ opacity: intensity }}>
                  <span className="cr-heat-val">{Math.round(intensity * 3200)}</span>
                  <span className="cr-heat-label">{hr}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CONTENT ───────────────────────────────────────── */}
      {tab === "content" && (
        <div className="cr-section">
          <h2 className="cr-subtitle">Top Performing Content</h2>
          <div className="cr-table">
            <div className="cr-table-header">
              <span>#</span>
              <span>Content</span>
              <span>Revenue</span>
              <span>Sales</span>
            </div>
            {topContent.map((item, i) => (
              <div key={item.title} className="cr-table-row">
                <span className="cr-table-rank">#{i + 1}</span>
                <span className="cr-table-title">{item.title}</span>
                <span className="cr-table-revenue">${item.revenue.toLocaleString()}</span>
                <span className="cr-table-sales">{item.purchases}</span>
              </div>
            ))}
          </div>

          <div className="cr-stat-grid cols-2" style={{ marginTop: "1.5rem" }}>
            <div className="cr-stat-card">
              <span className="cr-stat-value">18.3%</span>
              <span className="cr-stat-label">PPV Conversion Rate</span>
            </div>
            <div className="cr-stat-card">
              <span className="cr-stat-value">$12,940</span>
              <span className="cr-stat-label">Total Content Sales</span>
            </div>
          </div>
        </div>
      )}

      {/* ── GROWTH ────────────────────────────────────────── */}
      {tab === "growth" && (
        <div className="cr-section">
          <h2 className="cr-subtitle">Subscriber Growth</h2>
          <div className="cr-bar-chart">
            {subscriberGrowth.map((d) => (
              <div key={d.month} className="cr-bar-col">
                <div className="cr-bar green" style={{ height: `${(d.subs / maxSubs) * 100}%` }} />
                <span className="cr-bar-label">{d.month}</span>
                <span className="cr-bar-value">{d.subs.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <h2 className="cr-subtitle">Tier Breakdown</h2>
          <div className="cr-tier-bars">
            {tierBreakdown.map((tier) => (
              <div key={tier.label} className="cr-tier-row">
                <span className="cr-tier-label">{tier.label}</span>
                <div className="cr-tier-track">
                  <div className="cr-tier-fill" style={{ width: `${tier.pct}%`, background: tier.color }} />
                </div>
                <span className="cr-tier-count">{tier.count.toLocaleString()} ({tier.pct}%)</span>
              </div>
            ))}
          </div>

          <div className="cr-stat-grid cols-3" style={{ marginTop: "1.5rem" }}>
            <div className="cr-stat-card">
              <span className="cr-stat-value">168</span>
              <span className="cr-stat-label">New This Week</span>
            </div>
            <div className="cr-stat-card">
              <span className="cr-stat-value">2.1%</span>
              <span className="cr-stat-label">Churn Rate</span>
            </div>
            <div className="cr-stat-card">
              <span className="cr-stat-value">18%</span>
              <span className="cr-stat-label">Upgrade Rate</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
