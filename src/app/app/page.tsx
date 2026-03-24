import { unlockContent } from "@/app/actions";
import { canAccessContent, feedItems, priceLabel } from "@/lib/content";
import { requireSubscriber } from "@/lib/guards";
import { InteractionBar } from "@/components/InteractionBar";

export default async function ElJardinPage() {
  const session = await requireSubscriber();

  const pinned = feedItems.find((i) => i.pinned);
  const rest = feedItems.filter((i) => !i.pinned);

  return (
    <section className="temple-feed">
      <h1 className="section-title">El Jardín</h1>
      <p className="eyebrow">The Garden — daily blooms from the estate</p>

      {/* ── Pinned post ───────────────────────────────────── */}
      {pinned && (
        <article
          className="feed-card pinned"
          style={{ "--t1": pinned.thumb[0], "--t2": pinned.thumb[1] } as React.CSSProperties}
        >
          <div className="feed-thumb" />
          <span className="mood-tag">{pinned.mood}</span>
          <span className="pinned-badge">📌 Pinned</span>
          <h2>{pinned.title}</h2>
          <p>{pinned.description}</p>
          {pinned.postedAt && <span className="timestamp">{pinned.postedAt}</span>}
          <InteractionBar likes={pinned.likes} comments={pinned.comments} itemId={pinned.id} />
        </article>
      )}

      {/* ── Feed stream ───────────────────────────────────── */}
      {rest.map((item) => {
        const unlocked = canAccessContent(session, item);
        return (
          <article
            key={item.id}
            className="feed-card"
            style={{ "--t1": item.thumb[0], "--t2": item.thumb[1] } as React.CSSProperties}
          >
            <div className={`feed-thumb ${!unlocked && item.access !== "subscription" ? "locked-thumb" : ""}`}>
              {!unlocked && item.access !== "subscription" && (
                <span className="thumb-lock">🔒 {priceLabel(item.priceCents)}</span>
              )}
            </div>
            <span className="mood-tag">{item.mood}</span>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            {item.postedAt && <span className="timestamp">{item.postedAt}</span>}

            {!unlocked && item.access !== "subscription" ? (
              <form action={unlockContent} style={{ margin: "0 0.8rem 0" }}>
                <input type="hidden" name="contentId" value={item.id} />
                <input type="hidden" name="nextPath" value="/app" />
                <button type="submit" className="primary-btn small-btn">Unlock · {priceLabel(item.priceCents)}</button>
              </form>
            ) : (
              <div className="unlocked-chip" style={{ margin: "0 0.8rem" }}>✓ Access confirmed</div>
            )}

            <InteractionBar likes={item.likes} comments={item.comments} itemId={item.id} />
          </article>
        );
      })}
    </section>
  );
}
