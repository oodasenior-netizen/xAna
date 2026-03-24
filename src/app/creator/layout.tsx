import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { requireCreator } from "@/lib/guards";
import { LayoutDashboard, BarChart3, DollarSign, Archive, PenLine, MessageCircle, Bot, Shield, Wallet, Radio, User, Lock, Flower2 } from "lucide-react";

export default async function CreatorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireCreator();

  return (
    <div className="creator-shell">
      <aside className="creator-nav">
        <h2 className="creator-nav-brand"><Flower2 size={20} /> Goddess Annaleese</h2>
        <span className="creator-nav-role">Creator Portal</span>

        <nav className="creator-nav-links">
          <Link href="/creator" className="creator-nav-item">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link href="/creator/analytics" className="creator-nav-item">
            <BarChart3 size={16} /> Analytics
          </Link>
          <Link href="/creator/revenue" className="creator-nav-item">
            <DollarSign size={16} /> Revenue
          </Link>
          <Link href="/creator/vault" className="creator-nav-item">
            <Archive size={16} /> Vault
          </Link>
          <Link href="/creator/feed" className="creator-nav-item">
            <PenLine size={16} /> Feed
          </Link>
          <Link href="/creator/inbox" className="creator-nav-item">
            <MessageCircle size={16} /> Inbox
          </Link>
          <Link href="/creator/consultant" className="creator-nav-item">
            <Bot size={16} /> AI Consultant
          </Link>
          <Link href="/creator/admin" className="creator-nav-item">
            <Shield size={16} /> Admin
          </Link>
          <Link href="/creator/payouts" className="creator-nav-item">
            <Wallet size={16} /> Payouts
          </Link>
        </nav>

        <div className="creator-nav-footer">
          <button className="cr-go-live-btn" disabled>
            <Radio size={14} />
            Go Live
          </button>

          <Link href="/app" className="creator-nav-member-link">
            <User size={14} /> Member View
          </Link>

          <form action={logoutAction}>
            <button type="submit" className="secondary-btn small">
              <Lock size={14} /> Lock &amp; Exit
            </button>
          </form>
        </div>
      </aside>
      <main className="creator-main">{children}</main>
    </div>
  );
}
