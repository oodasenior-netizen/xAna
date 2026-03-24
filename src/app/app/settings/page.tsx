import { requireSubscriber } from "@/lib/guards";
import { getSessionFromCookies } from "@/lib/auth";

export default async function SettingsPage() {
  const session = (await getSessionFromCookies())!;

  return (
    <section className="settings-page">
      <h1 className="section-title">Settings</h1>
      <p className="eyebrow">Manage your hacienda experience</p>

      {/* ── Notifications ─────────────────────────────────── */}
      <div className="settings-group">
        <h2>Notifications</h2>
        <div className="settings-row">
          <span>New content alerts</span>
          <label className="settings-toggle">
            <input type="checkbox" defaultChecked disabled />
            <span className="toggle-track" />
          </label>
        </div>
        <div className="settings-row">
          <span>Live session reminders</span>
          <label className="settings-toggle">
            <input type="checkbox" defaultChecked disabled />
            <span className="toggle-track" />
          </label>
        </div>
        <div className="settings-row">
          <span>New scroll messages</span>
          <label className="settings-toggle">
            <input type="checkbox" defaultChecked disabled />
            <span className="toggle-track" />
          </label>
        </div>
      </div>

      {/* ── Display ───────────────────────────────────────── */}
      <div className="settings-group">
        <h2>Display</h2>
        <div className="settings-row">
          <span>Autoplay media</span>
          <label className="settings-toggle">
            <input type="checkbox" disabled />
            <span className="toggle-track" />
          </label>
        </div>
        <div className="settings-row">
          <span>Reduce animations</span>
          <label className="settings-toggle">
            <input type="checkbox" disabled />
            <span className="toggle-track" />
          </label>
        </div>
      </div>

      {/* ── Account ───────────────────────────────────────── */}
      <div className="settings-group">
        <h2>Account</h2>
        <div className="settings-row">
          <span>Plan</span>
          <span className="settings-value">
            {session.plan === "yearly"
              ? "La Alcoba"
              : session.plan === "quarterly"
                ? "El Salón"
                : "El Jardín"}
          </span>
        </div>
        <div className="settings-row">
          <span>Member since</span>
          <span className="settings-value">
            {new Date(session.fanSince).toLocaleDateString()}
          </span>
        </div>
        <div className="settings-row">
          <span>Role</span>
          <span className="settings-value">{session.role}</span>
        </div>
      </div>
    </section>
  );
}
