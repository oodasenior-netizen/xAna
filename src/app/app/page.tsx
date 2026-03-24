import { unlockContent } from "@/app/actions";
import { priceLabel } from "@/lib/content";
import { requireSubscriber } from "@/lib/guards";
import { readStore } from "@/lib/store";
import { InteractionBar } from "@/components/InteractionBar";
import { Play, Lock } from "lucide-react";

export default async function ElJardinPage() {
  const session = await requireSubscriber();
  const { feedPosts } = readStore();

  function canAccess(item: { access: string; id: string }) {
    if (session.role === "creator") return true;
    if (item.access === "subscription") return true;
    return session.ownedContent.includes(item.id);
  }

  const pinned = feedPosts.find((i) => i.pinned);
  const rest = feedPosts.filter((i) => !i.pinned);

  return (
    <section className="temple-feed">
      <h1 className="section-title">El Jardin</h1>
      <p className="eyebrow">The Garden — daily blooms from the estate</p>

      {pinned && (
        <article
          className="feed-card pinned"
          style={{ "--t1": pinned.thumb[0], "--t2": pinned.thumb[1] } as React.CSSProperties}
        >
          <div className="feed-thumb" />
          <span className="mood-tag">{pinned.mood}</span>
          <span className="pinned-badge">Pinned</span>
          <h2>{pinned.title}</h2>
          <p>{pinned.description}</p>
          {pinned.postedAt && <span className="timestamp">{pinned.postedAt}</span>}
          {pinned.videoUrl && (
            <a
              href={"/app/watch?url=" + encodeURIComponent(pinned.videoUrl) + "&title=" + encodeURIComponent(pinned.title)}
              className="feed-play-link"
            >
              <Play size={14} /> Watch
            </a>
          )}
          <InteractionBar likes={pinned.likes} comments={pinned.comments} itemId={pinned.id} />
        </article>
      )}

      {rest.map((item) => {
        const unlocked = canAccess(item);
        return (
          <article
            key={item.id}
            className="feed-card"
            style={{ "--t1": item.thumb[0], "--t2": item.thumb[1] } as React.CSSProperties}
          >
            <div className={`feed-thumb ${!unlocked && item.access !== "subscription" ? "locked-thumb" : ""}`}>
              {!unlocked && item.access !== "subscription" && (
                <span className="thumb-lock">
                  <Lock size={14} /> {priceLabel(item.priceCents)}
                </span>
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
                <button type="submit" className="primary-btn small-btn">
                  Unlock - {priceLabel(item.priceCents)}
                </button>
              </form>
            ) : (
              <div style={{ margin: "0 0.8rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <div className="unlocked-chip">Access confirmed</div>
                {unlocked && item.videoUrl && (
                  <a
                    href={"/app/watch?url=" + encodeURIComponent(item.videoUrl) + "&title=" + encodeURIComponent(item.title) + "&type=" + (item.type ?? "video")}
                    className="feed-play-link"
                  >
                    <Play size={13} /> Watch
                  </a>
                )}
              </div>
            )}

            <InteractionBar likes={item.likes} comments={item.comments} itemId={item.id} />
          </article>
        );
      })}
    </section>
  );
}