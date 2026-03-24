import { getSessionFromCookies } from "@/lib/auth";

export default async function SettingsPage() {
  const session = (await getSessionFromCookies())!;
  const planName = session.plan === "yearly" ? "La Alcoba" : session.plan === "quarterly" ? "El Salón" : "El Jardín";
  const planEmoji = session.plan === "yearly" ? "🗝️" : session.plan === "quarterly" ? "🪞" : "🌿";

  return (
    <section className="settings-page">
      <h1 className="section-title">Settings</h1>

      {/* ── Profile card ──────────────────────────────────── */}
      <div className="settings-profile-card">
        <div className="settings-avatar">
          <span>👤</span>
        </div>
        <div className="settings-profile-info">
          <p className="settings-profile-name">Guest Member</p>
          <p className="settings-profile-plan">{planEmoji} {planName}</p>
          <p className="settings-profile-since">
            Member since {new Date(session.fanSince).toLocaleDateString()}
          </p>
        </div>
        <div className="settings-profile-stats">
          <div className="settings-stat">
            <span className="settings-stat-value">{session.loyaltyPoints}</span>
            <span className="settings-stat-label">Points</span>
          </div>
          <div className="settings-stat">
            <span className="settings-stat-value">{session.ownedContent.length}</span>
            <span className="settings-stat-label">Unlocked</span>
          </div>
        </div>
      </div>

      {/* ── Notifications ─────────────────────────────────── */}
      <div className="settings-group">
        <h2>🔔 Notifications</h2>
        <div className="settings-row">
          <div className="settings-row-text">
            <span>New content alerts</span>
            <span className="settings-row-desc">Get notified when new posts drop</span>
          </div>
          <label className="settings-toggle">
            <input type="checkbox" defaultChecked disabled />
            <span className="toggle-track" />
          </label>
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <span>Live session reminders</span>
            <span className="settings-row-desc">Alerts before La Terraza goes live</span>
          </div>
          <label className="settings-toggle">
            <input type="checkbox" defaultChecked disabled />
            <span className="toggle-track" />
          </label>
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <span>New scroll messages</span>
            <span className="settings-row-desc">Private messages and updates</span>
          </div>
          <label className="settings-toggle">
            <input type="checkbox" defaultChecked disabled />
            <span className="toggle-track" />
          </label>
        </div>
      </div>

      {/* ── Display ───────────────────────────────────────── */}
      <div className="settings-group">
        <h2>🎨 Display</h2>
        <div className="settings-row">
          <div className="settings-row-text">
            <span>Autoplay media</span>
            <span className="settings-row-desc">Videos play automatically in feed</span>
          </div>
          <label className="settings-toggle">
            <input type="checkbox" disabled />
            <span className="toggle-track" />
          </label>
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <span>Reduce animations</span>
            <span className="settings-row-desc">Simplify transitions and effects</span>
          </div>
          <label className="settings-toggle">
            <input type="checkbox" disabled />
            <span className="toggle-track" />
          </label>
        </div>
      </div>

      {/* ── Account ───────────────────────────────────────── */}
      <div className="settings-group">
        <h2>⚙️ Account</h2>
        <div className="settings-row">
          <span>Current Plan</span>
          <span className="settings-value">{planEmoji} {planName}</span>
        </div>
        <div className="settings-row">
          <span>Role</span>
          <span className="settings-value capitalize">{session.role}</span>
        </div>
      </div>
    </section>
  );
}
