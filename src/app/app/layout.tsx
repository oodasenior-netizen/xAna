import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { requireSubscriber } from "@/lib/guards";
import { tierBadge } from "@/lib/content";
import { Leaf, Wine, MessageCircle, Moon, User, Settings } from "lucide-react";
import { GoldParticles } from "@/components/GoldParticles";

export default async function SubscriberLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSubscriber();

  return (
    <div className="shrine-shell">
      <GoldParticles density="light" />
      <main className="shrine-main">{children}</main>

      {/* ── 5-tab bottom navigation ──────────────────────── */}
      <nav className="shrine-tabs" aria-label="Main navigation">
        <Link href="/app" className="tab-link">
          <Leaf size={20} className="tab-icon" />
          <span className="tab-label">Feed</span>
        </Link>
        <Link href="/app/vault" className="tab-link">
          <Wine size={20} className="tab-icon" />
          <span className="tab-label">Vault</span>
        </Link>
        <Link href="/app/scroll" className="tab-link">
          <MessageCircle size={20} className="tab-icon" />
          <span className="tab-label">Messages</span>
        </Link>
        <Link href="/app/sanctuary" className="tab-link">
          <Moon size={20} className="tab-icon" />
          <span className="tab-label">Live</span>
        </Link>
        <Link href="/app/altar" className="tab-link">
          <User size={20} className="tab-icon" />
          <span className="tab-label">Profile</span>
        </Link>
      </nav>

      {/* ── Top status bar ────────────────────────────────── */}
      <div className="shrine-status-bar">
        <span className="tier-chip">{tierBadge(session.plan)}</span>
        <Link href="/app/offering" className="offering-link">Offering</Link>
        <Link href="/app/settings" className="settings-link"><Settings size={14} /></Link>
        <form action={logoutAction}>
          <button type="submit" className="status-logout">Leave</button>
        </form>
      </div>
    </div>
  );
}
