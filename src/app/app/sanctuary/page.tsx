import { requireSubscriber } from "@/lib/guards";

export default async function TerrazaPage() {
  await requireSubscriber();

  return (
    <section className="sanctuary-page">
      <h1 className="section-title">La Terraza</h1>
      <p className="eyebrow">The Terrace — live evenings under the stars</p>

      {/* ── Live status indicator ─────────────────────────── */}
      <div className="sanctuary-status offline">
        <span className="sanctuary-dot" />
        <span>The terrace is quiet right now</span>
      </div>

      <div className="sanctuary-stage">
        <div className="sanctuary-screen">
          <p>When the host goes live, the evening begins here.</p>
        </div>
      </div>

      {/* ── Tip zone ──────────────────────────────────────── */}
      <div className="sanctuary-tips-zone">
        <p className="eyebrow">Send a gift during live sessions</p>
        <div className="sanctuary-tip-btns">
          <button className="tip-bubble" disabled>🌸 $5</button>
          <button className="tip-bubble" disabled>🍷 $15</button>
          <button className="tip-bubble" disabled>🔥 $50</button>
        </div>
      </div>

      {/* ── Past replays ──────────────────────────────────── */}
      <div className="sanctuary-replays">
        <h2>Terrace Replays</h2>
        <article className="replay-card">
          <h3>Moonlit Garden — Live Session Replay</h3>
          <p>2 hours · 1.2k viewers · Replay available in La Bodega</p>
          <span className="timestamp">Mar 18, 9:00 PM</span>
        </article>
        <article className="replay-card">
          <h3>Sunset Q&amp;A on the Terrace</h3>
          <p>48 min · 890 viewers · Replay available in La Bodega</p>
          <span className="timestamp">Mar 15, 8:30 PM</span>
        </article>
      </div>
    </section>
  );
}
