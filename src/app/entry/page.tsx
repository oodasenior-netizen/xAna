import { creatorProfile, pricingPlans } from "@/lib/content";
import { creatorLogin, subscribeAndEnter } from "@/app/actions";
import Image from "next/image";

type EntryPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function EntryPage({ searchParams }: EntryPageProps) {
  const { error } = await searchParams;

  return (
    <main className="gateway">
      {/* ── Hero: gated villa arrival ─────────────────────── */}
      <section className="gw-hero">
        <div className="gw-hero-overlay" />
        <div className="gw-hero-content">
          {/* Full-body creator portrait */}
          <div className="gw-creator-photo">
            <div className="gw-photo-glow" />
            <div className="gw-photo-frame">
              <Image
                src="/annalesse.png"
                alt={creatorProfile.name}
                width={480}
                height={640}
                className="gw-creator-img"
                priority
              />
            </div>
            <div className="gw-photo-outline" />
          </div>

          <h1 className="gw-name">{creatorProfile.name}</h1>
          <p className="gw-tagline">{creatorProfile.tagline}</p>
        </div>
      </section>

      {/* ── Collage grid (replacing scattered absolutes) ──── */}
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

      {/* ── Social proof strip ────────────────────────────── */}
      <div className="gw-proof">
        <span className="gw-proof-pill">🌺 {creatorProfile.memberCount} guests inside</span>
        <div className="gw-ticker">
          <span>🔥 &quot;This is unlike anything else&quot;</span>
          <span>🍷 &quot;Best subscription I own&quot;</span>
          <span>🌙 &quot;Completely addictive content&quot;</span>
          <span>✨ &quot;Worth every single cent&quot;</span>
          <span>🌿 &quot;Feels like a private world&quot;</span>
        </div>
      </div>

      {/* ── Teaser blurred previews ───────────────────────── */}
      <section className="gw-teasers">
        <div className="gw-teaser-card blur-card" />
        <div className="gw-teaser-card blur-card" />
        <div className="gw-teaser-card blur-card" />
        <div className="gw-teaser-card blur-card" />
      </section>

      {/* ── Locked preview reel ───────────────────────────── */}
      <section className="gw-reel">
        <div className="gw-reel-inner">
          <div className="gw-reel-bar" />
          <p>Preview reel — 5 s teaser</p>
          <div className="gw-reel-blur" />
        </div>
      </section>

      {/* ── What awaits inside ────────────────────────────── */}
      <section className="gw-expect">
        <h2>What Awaits Inside the Hacienda</h2>
        <ul className="gw-expect-list">
          {creatorProfile.teaserLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      {/* ── Pricing tiers (room names) ────────────────────── */}
      <section className="gw-pricing" id="pricing">
        <h2>Choose Your Room</h2>
        <div className="gw-pricing-grid">
          {pricingPlans.map((plan) => (
            <article
              key={plan.id}
              className={`gw-price-card ${plan.highlight ? "gw-price-highlight" : ""}`}
            >
              {plan.highlight && <span className="gw-best-badge">Best Value</span>}
              <h3>{plan.label}</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--ink-muted)", margin: "0.1rem 0 0.4rem" }}>
                {plan.subtitle}
              </p>
              <p className="gw-price">
                {plan.price}
                <span>{plan.period}</span>
              </p>
              <ul>
                {plan.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <form action={subscribeAndEnter}>
                <input type="hidden" name="plan" value={plan.id} />
                <button type="submit" className="gw-enter-btn">
                  Enter
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>

      {/* ── Creator login (hidden lock) ───────────────────── */}
      <section className="gw-creator-lock">
        <details>
          <summary>Creator Portal</summary>
          {error && <p className="error-note">Creator login failed.</p>}
          <form action={creatorLogin} className="creator-form">
            <input name="email" type="email" placeholder="Creator email" required />
            <input name="password" type="password" placeholder="Creator password" required />
            <button type="submit" className="secondary-btn">
              Unlock Portal
            </button>
          </form>
        </details>
      </section>
    </main>
  );
}
