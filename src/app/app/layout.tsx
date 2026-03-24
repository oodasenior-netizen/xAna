import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { requireSubscriber } from "@/lib/guards";
import { tierBadge } from "@/lib/content";

export default async function SubscriberLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSubscriber();

  return (
    <div className="shrine-shell">
      <main className="shrine-main">{children}</main>

      {/* ── 5-tab bottom navigation ──────────────────────── */}
      <nav className="shrine-tabs" aria-label="Main navigation">
        <Link href="/app" className="tab-link">
          <span className="tab-icon">🌿</span>
          <span className="tab-label">Jardín</span>
        </Link>
        <Link href="/app/vault" className="tab-link">
          <span className="tab-icon">🍷</span>
          <span className="tab-label">Bodega</span>
        </Link>
        <Link href="/app/scroll" className="tab-link">
          <span className="tab-icon">💌</span>
          <span className="tab-label">Scroll</span>
        </Link>
        <Link href="/app/sanctuary" className="tab-link">
          <span className="tab-icon">🌙</span>
          <span className="tab-label">Terraza</span>
        </Link>
        <Link href="/app/altar" className="tab-link">
          <span className="tab-icon">👤</span>
          <span className="tab-label">Mi Rincón</span>
        </Link>
      </nav>

      {/* ── Top status bar ────────────────────────────────── */}
      <div className="shrine-status-bar">
        <span className="tier-chip">{tierBadge(session.plan)}</span>
        <Link href="/app/offering" className="offering-link">Offering</Link>
        <Link href="/app/settings" className="settings-link">⚙️</Link>
        <form action={logoutAction}>
          <button type="submit" className="status-logout">Leave</button>
        </form>
      </div>
    </div>
  );
}
