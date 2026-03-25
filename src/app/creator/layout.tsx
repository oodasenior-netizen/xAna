"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions";
import { LayoutDashboard, BarChart3, DollarSign, Archive, PenLine, MessageCircle, Bot, Shield, Wallet, Radio, User, Lock, Flower2, Menu, X, HardDrive } from "lucide-react";
import { GoldParticles } from "@/components/GoldParticles";

const navLinks = [
  { href: "/creator", label: "Dashboard", icon: LayoutDashboard },
  { href: "/creator/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/creator/revenue", label: "Revenue", icon: DollarSign },
  { href: "/creator/vault", label: "Vault", icon: Archive },
  { href: "/creator/feed", label: "Feed", icon: PenLine },
  { href: "/creator/storage", label: "Storage", icon: HardDrive },
  { href: "/creator/inbox", label: "Inbox", icon: MessageCircle },
  { href: "/creator/consultant", label: "AI Consultant", icon: Bot },
  { href: "/creator/admin", label: "Admin", icon: Shield },
  { href: "/creator/payouts", label: "Payouts", icon: Wallet },
];

export default function CreatorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/creator") return pathname === "/creator";
    return pathname.startsWith(href);
  }

  const sidebar = (
    <>
      <div className="creator-nav-header">
        <h2 className="creator-nav-brand"><Flower2 size={20} /> Goddess Annaleese</h2>
        <button
          className="creator-nav-close"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close navigation menu"
        >
          <X size={20} />
        </button>
      </div>
      <span className="creator-nav-role">Creator Portal</span>

      <nav className="creator-nav-links">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`creator-nav-item${isActive(href) ? " creator-nav-active" : ""}`}
            onClick={() => setDrawerOpen(false)}
          >
            <Icon size={16} /> {label}
          </Link>
        ))}
      </nav>

      <div className="creator-nav-footer">
        <button className="cr-go-live-btn" disabled>
          <Radio size={14} />
          Go Live
        </button>

        <Link href="/app" className="creator-nav-member-link" onClick={() => setDrawerOpen(false)}>
          <User size={14} /> Member View
        </Link>

        <form action={logoutAction}>
          <button type="submit" className="secondary-btn small">
            <Lock size={14} /> Lock &amp; Exit
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="creator-shell">
      <GoldParticles density="light" />

      {/* Mobile Hamburger Button */}
      <button
        className="creator-hamburger"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>

      {/* Sidebar Navigation */}
      <aside className={`creator-nav ${drawerOpen ? "creator-nav-open" : ""}`}>
        {sidebar}
      </aside>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div
          className="creator-drawer-overlay"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <main className="creator-main">{children}</main>
    </div>
  );
}
