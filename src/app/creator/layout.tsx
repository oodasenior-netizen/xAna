"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/app/actions";
import { LayoutDashboard, BarChart3, DollarSign, Archive, PenLine, MessageCircle, Bot, Shield, Wallet, Radio, User, Lock, Flower2, Menu, X } from "lucide-react";
import { GoldParticles } from "@/components/GoldParticles";

export default function CreatorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="creator-shell">
      {/* Mobile Hamburger Button */}
      <button
        className="creator-hamburger"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Navigation Drawer */}
      <aside className={`creator-nav ${drawerOpen ? 'creator-nav-open' : ''}`}>
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
          <Link href="/creator" className="creator-nav-item" onClick={() => setDrawerOpen(false)}>
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link href="/creator/analytics" className="creator-nav-item" onClick={() => setDrawerOpen(false)}>
            <BarChart3 size={16} /> Analytics
          </Link>
          <Link href="/creator/revenue" className="creator-nav-item" onClick={() => setDrawerOpen(false)}>
            <DollarSign size={16} /> Revenue
          </Link>
          <Link href="/creator/vault" className="creator-nav-item" onClick={() => setDrawerOpen(false)}>
            <Archive size={16} /> Vault
          </Link>
          <Link href="/creator/feed" className="creator-nav-item" onClick={() => setDrawerOpen(false)}>
            <PenLine size={16} /> Feed
          </Link>
          <Link href="/creator/inbox" className="creator-nav-item" onClick={() => setDrawerOpen(false)}>
            <MessageCircle size={16} /> Inbox
          </Link>
          <Link href="/creator/consultant" className="creator-nav-item" onClick={() => setDrawerOpen(false)}>
            <Bot size={16} /> AI Consultant
          </Link>
          <Link href="/creator/admin" className="creator-nav-item" onClick={() => setDrawerOpen(false)}>
            <Shield size={16} /> Admin
          </Link>
          <Link href="/creator/payouts" className="creator-nav-item" onClick={() => setDrawerOpen(false)}>
            <Wallet size={16} /> Payouts
          </Link>
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
