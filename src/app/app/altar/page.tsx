import { requireSubscriber } from "@/lib/guards";
import { getSessionFromCookies } from "@/lib/auth";
import { creatorProfile, tierBadge } from "@/lib/content";

export default async function AltarPage() {
  const session = (await getSessionFromCookies())!;
  const badge = tierBadge(session.plan);

  return (
    <section className="altar-page">
      <h1 className="section-title">Mi Rincón</h1>
      <p className="eyebrow">Your private corner of the hacienda</p>

      {/* ── Profile card ──────────────────────────────────── */}
      <div className="altar-profile">
        <div className="altar-avatar">👤</div>
        <h2 className="altar-name">Loyal Guest</h2>
        <span className="altar-tier">{badge}</span>
        <p className="altar-since">
          Member since {new Date(session.fanSince).toLocaleDateString()}
        </p>
      </div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="altar-stats-grid">
        <div className="altar-stat-card">
          <span className="altar-stat-value">{session.loyaltyPoints}</span>
          <span className="altar-stat-label">Loyalty Points</span>
        </div>
        <div className="altar-stat-card">
          <span className="altar-stat-value">{session.ownedContent.length}</span>
          <span className="altar-stat-label">Unlocked Items</span>
        </div>
        <div className="altar-stat-card">
          <span className="altar-stat-value">
            {Math.floor(
              (Date.now() - new Date(session.fanSince).getTime()) /
                (1000 * 60 * 60 * 24)
            )}
          </span>
          <span className="altar-stat-label">Days in Hacienda</span>
        </div>
      </div>

      {/* ── Collection ────────────────────────────────────── */}
      <div className="altar-collection">
        <h2>Your Collection</h2>
        {session.ownedContent.length === 0 ? (
          <p className="altar-empty">
            Nothing here yet — visit La Bodega to start collecting.
          </p>
        ) : (
          <ul className="altar-owned-list">
            {session.ownedContent.map((id) => (
              <li key={id} className="altar-owned-item">
                🗝️ {id}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Leaderboard teaser ────────────────────────────── */}
      <div className="altar-leaderboard">
        <h2>Hacienda Leaderboard</h2>
        <div className="altar-rank-list">
          {[
            { rank: 1, name: "luna_dreams", pts: 4200 },
            { rank: 2, name: "velvet_rose", pts: 3850 },
            { rank: 3, name: "midnight_sky", pts: 3100 },
            { rank: 4, name: "You", pts: session.loyaltyPoints },
          ].map((r) => (
            <div
              key={r.rank}
              className={`altar-rank-row ${r.name === "You" ? "you" : ""}`}
            >
              <span className="altar-rank">#{r.rank}</span>
              <span className="altar-rank-name">{r.name}</span>
              <span className="altar-rank-pts">{r.pts} pts</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
