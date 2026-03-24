import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { requireCreator } from "@/lib/guards";

export default async function CreatorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireCreator();

  return (
    <div className="creator-shell">
      <aside className="creator-nav">
        <h2 className="creator-nav-brand">🏡 La Hacienda</h2>
        <span className="creator-nav-role">Creator Portal</span>

        <nav className="creator-nav-links">
          <Link href="/creator" className="creator-nav-item">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/creator/analytics" className="creator-nav-item">
            <span>📈</span> Analytics
          </Link>
          <Link href="/creator/revenue" className="creator-nav-item">
            <span>💵</span> Revenue
          </Link>
          <Link href="/creator/vault" className="creator-nav-item">
            <span>📦</span> Vault
          </Link>
          <Link href="/creator/feed" className="creator-nav-item">
            <span>✍️</span> Feed
          </Link>
          <Link href="/creator/inbox" className="creator-nav-item">
            <span>💌</span> Inbox
          </Link>
          <Link href="/creator/consultant" className="creator-nav-item">
            <span>🤖</span> AI Consultant
          </Link>
          <Link href="/creator/admin" className="creator-nav-item">
            <span>🛡️</span> Admin
          </Link>
          <Link href="/creator/payouts" className="creator-nav-item">
            <span>💰</span> Payouts
          </Link>
        </nav>

        <div className="creator-nav-footer">
          {/* Go Live Button */}
          <button className="cr-go-live-btn" disabled>
            <span className="cr-live-dot" />
            Go Live on La Terraza
          </button>

          <Link href="/app" className="creator-nav-member-link">
            👤 Member View
          </Link>

          <form action={logoutAction}>
            <button type="submit" className="secondary-btn small">
              🔒 Lock &amp; Exit
            </button>
          </form>
        </div>
      </aside>
      <main className="creator-main">{children}</main>
    </div>
  );
}
