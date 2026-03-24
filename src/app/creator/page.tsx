import { requireCreator } from "@/lib/guards";

export default async function CreatorDashboardPage() {
  const session = await requireCreator();

  return (
    <section className="cr-page">
      <p className="eyebrow">Creator Dashboard</p>
      <h1 className="section-title">Welcome back, {session.userId}</h1>

      {/* ── Quick stat cards ──────────────────────────────── */}
      <div className="cr-stat-grid">
        <div className="cr-stat-card accent">
          <span className="cr-stat-value">4,200</span>
          <span className="cr-stat-label">Subscribers</span>
        </div>
        <div className="cr-stat-card">
          <span className="cr-stat-value">$19,380</span>
          <span className="cr-stat-label">Monthly Revenue</span>
        </div>
        <div className="cr-stat-card">
          <span className="cr-stat-value">$2,480</span>
          <span className="cr-stat-label">Available Balance</span>
        </div>
        <div className="cr-stat-card">
          <span className="cr-stat-value">3</span>
          <span className="cr-stat-label">Pending Reports</span>
        </div>
      </div>

      {/* ── Recent activity ───────────────────────────────── */}
      <h2 className="cr-subtitle">Recent Activity</h2>
      <div className="cr-activity-list">
        {[
          { icon: "💰", text: "luna_dreams subscribed to El Salón", time: "2 min ago" },
          { icon: "🔓", text: "velvet_rose unlocked Velvet Night Director Cut", time: "18 min ago" },
          { icon: "🪙", text: "midnight_sky sent a Fuego tip ($50)", time: "1 hour ago" },
          { icon: "📩", text: "New message from golden_dusk", time: "2 hours ago" },
          { icon: "🔓", text: "amber_light purchased Hacienda Print Collection", time: "3 hours ago" },
          { icon: "🌿", text: "blossom_fan upgraded to La Alcoba", time: "5 hours ago" },
          { icon: "📩", text: "3 new messages in inbox", time: "Today, 11:30 AM" },
          { icon: "💰", text: "sunset_watcher subscribed to El Jardín", time: "Yesterday" },
        ].map((a, i) => (
          <div key={i} className="cr-activity-row">
            <span className="cr-activity-icon">{a.icon}</span>
            <span className="cr-activity-text">{a.text}</span>
            <span className="timestamp">{a.time}</span>
          </div>
        ))}
      </div>

      {/* ── Quick actions ─────────────────────────────────── */}
      <h2 className="cr-subtitle">Quick Actions</h2>
      <div className="cr-quick-actions">
        <a href="/creator/feed" className="cr-action-card">
          <span>✍️</span>
          <span>New Post</span>
        </a>
        <a href="/creator/vault" className="cr-action-card">
          <span>📦</span>
          <span>Upload Media</span>
        </a>
        <a href="/creator/inbox" className="cr-action-card">
          <span>💌</span>
          <span>Check Inbox</span>
        </a>
        <a href="/creator/payouts" className="cr-action-card">
          <span>💰</span>
          <span>Payouts</span>
        </a>
        <a href="/creator/consultant" className="cr-action-card">
          <span>🤖</span>
          <span>Ask AI</span>
        </a>
        <a href="/creator/analytics" className="cr-action-card">
          <span>📊</span>
          <span>Analytics</span>
        </a>
      </div>
    </section>
  );
}
