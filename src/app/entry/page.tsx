import { creatorProfile, pricingPlans } from "@/lib/content";
import { creatorLogin, subscribeAndEnter } from "@/app/actions";
import Image from "next/image";
import { Star, Lock, CheckCircle, Users, Sparkles, MessageCircle, Eye, Zap } from "lucide-react";

type EntryPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function EntryPage({ searchParams }: EntryPageProps) {
  const { error } = await searchParams;

  return (
    <main className="gateway">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="gw-hero">
        <div className="gw-hero-overlay" />
        <div className="gw-hero-content">
          <div className="gw-creator-photo">
            <Image
              src="/annalesse.png"
              alt={creatorProfile.name}
              width={480}
              height={640}
              className="gw-creator-img"
              priority
            />
          </div>

          <h1 className="gw-name">{creatorProfile.name}</h1>
          <p className="gw-tagline">{creatorProfile.tagline}</p>

          <div className="gw-hero-stats">
            <span className="gw-stat-pill"><Users size={14} /> {creatorProfile.memberCount} members</span>
            <span className="gw-stat-pill"><Star size={14} /> Exclusive</span>
          </div>
        </div>
      </section>

      {/* ── Collage grid ─────────────────────────────────── */}
      <section className="gw-collage-section">
        <div className="gw-collage-grid">
          {creatorProfile.collageQuotes.map((q, i) => (
            <div key={i} className="gw-collage-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <p className="gw-collage-text">{q.text}</p>
              <span className="gw-collage-label">{q.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social proof ─────────────────────────────────── */}
      <div className="gw-proof">
        <span className="gw-proof-pill"><Sparkles size={14} /> {creatorProfile.memberCount} members inside</span>
        <div className="gw-ticker">
          <span><Zap size={12} /> &quot;This is unlike anything else&quot;</span>
          <span><Star size={12} /> &quot;Best subscription I own&quot;</span>
          <span><Eye size={12} /> &quot;Completely addictive content&quot;</span>
          <span><CheckCircle size={12} /> &quot;Worth every single cent&quot;</span>
          <span><MessageCircle size={12} /> &quot;Feels like a private world&quot;</span>
        </div>
      </div>

      {/* ── Teaser blurred previews ──────────────────────── */}
      <section className="gw-teasers">
        <div className="gw-teaser-card blur-card" />
        <div className="gw-teaser-card blur-card" />
        <div className="gw-teaser-card blur-card" />
        <div className="gw-teaser-card blur-card" />
      </section>

      {/* ── What awaits ──────────────────────────────────── */}
      <section className="gw-expect">
        <h2>What Awaits Inside</h2>
        <ul className="gw-expect-list">
          {creatorProfile.teaserLines.map((line) => (
            <li key={line}><CheckCircle size={16} /> {line}</li>
          ))}
        </ul>
      </section>

      {/* ── Pricing with floating animation ──────────────── */}
      <section className="gw-pricing" id="pricing">
        <h2>Join Now</h2>
        <div className="gw-pricing-grid">
          {pricingPlans.map((plan) => (
            <article
              key={plan.id}
              className={`gw-price-card ${plan.highlight ? "gw-price-highlight" : ""}`}
            >
              <span className="gw-best-badge"><Star size={14} /> Premium</span>
              <h3>{plan.label}</h3>
              <p className="gw-price-subtitle">{plan.subtitle}</p>
              <p className="gw-price gw-price-float">
                {plan.price}
                <span>{plan.period}</span>
              </p>
              <ul>
                {plan.perks.map((perk) => (
                  <li key={perk}><CheckCircle size={14} /> {perk}</li>
                ))}
              </ul>
              <form action={subscribeAndEnter}>
                <input type="hidden" name="plan" value={plan.id} />
                <button type="submit" className="gw-enter-btn">
                  <Lock size={16} /> Subscribe Now
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>

      {/* ── Creator portal (hidden text link at bottom) ─── */}
      <div className="gw-creator-link-wrap">
        <details className="gw-creator-link-details">
          <summary className="gw-creator-link-summary">Creator access</summary>
          <div className="gw-fab-panel gw-creator-inline-panel">
            <h3><Lock size={16} /> Creator Portal</h3>
            {error && <p className="error-note">Invalid credentials. Please try again.</p>}
            <form action={creatorLogin} className="creator-form">
              <input name="email" type="text" placeholder="Username" required autoComplete="username" />
              <input name="password" type="password" placeholder="Password" required autoComplete="current-password" />
              <button type="submit" className="primary-btn">
                <Lock size={14} /> Unlock
              </button>
            </form>
          </div>
        </details>
      </div>
    </main>
  );
}
