import { requireSubscriber } from "@/lib/guards";
import { getSessionFromCookies } from "@/lib/auth";
import { tipTiers, priceLabel } from "@/lib/content";
import { sendTip } from "@/app/actions";

export default async function OfferingPage() {
  const session = (await getSessionFromCookies())!;

  return (
    <section className="offering-page">
      <h1 className="section-title">The Offering</h1>
      <p className="eyebrow">Show your appreciation — leave a gift at the gate</p>

      {/* ── Tip tiers ─────────────────────────────────────── */}
      <div className="offering-tiers">
        {tipTiers.map((t) => (
          <form key={t.id} action={sendTip}>
            <input type="hidden" name="tierId" value={t.id} />
            <button className="offering-card" type="submit">
              <span className="offering-emoji">{t.emoji}</span>
              <span className="offering-name">{t.label}</span>
              <span className="offering-price">{priceLabel(t.amountCents)}</span>
            </button>
          </form>
        ))}
      </div>

      {/* ── Points display ────────────────────────────────── */}
      <div className="offering-points">
        <p>
          Your Loyalty Points: <strong>{session.loyaltyPoints}</strong>
        </p>
      </div>

      {/* ── Request queue (placebo) ───────────────────────── */}
      <div className="offering-requests">
        <h2>Request Board</h2>
        <p className="eyebrow">Community-voted requests for upcoming content</p>
        <div className="offering-req-list">
          {[
            { text: "Acoustic cover of Moonlight Sonata", votes: 42 },
            { text: "Behind-the-scenes of the last photoshoot", votes: 38 },
            { text: "Q&A about your creative process", votes: 27 },
          ].map((r, i) => (
            <div key={i} className="offering-req-item">
              <span className="offering-req-votes">▲ {r.votes}</span>
              <span className="offering-req-text">{r.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
