import { unlockContent } from "@/app/actions";
import { canAccessContent, priceLabel, vaultItems } from "@/lib/content";
import { requireSubscriber } from "@/lib/guards";
import { InteractionBar } from "@/components/InteractionBar";

export default async function BodegaPage() {
  const session = await requireSubscriber();

  return (
    <section className="vault-page">
      <h1 className="section-title">La Bodega</h1>
      <p className="vault-intro">The wine cellar. Private reserves, aged to perfection.</p>

      <div className="vault-sort">
        <span className="vault-sort-active">New Arrivals</span>
        <span>Most Popular</span>
        <span>Fan Favorites</span>
      </div>

      <div className="vault-grid">
        {vaultItems.map((item) => {
          const unlocked = canAccessContent(session, item);
          return (
            <article
              key={item.id}
              className={`vault-tile ${unlocked ? "vault-open" : "vault-locked"}`}
              style={{ "--t1": item.thumb[0], "--t2": item.thumb[1] } as React.CSSProperties}
            >
              <div className="vault-tile-thumb">
                {!unlocked && <span className="vault-lock-icon">🔒</span>}
              </div>
              <div className="vault-tile-body">
                <span className="mood-tag">{item.mood}</span>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <p className="vault-price">{unlocked ? "Owned" : priceLabel(item.priceCents)}</p>

                {!unlocked && (
                  <form action={unlockContent}>
                    <input type="hidden" name="contentId" value={item.id} />
                    <input type="hidden" name="nextPath" value="/app/vault" />
                    <button type="submit" className="primary-btn small-btn">Uncork</button>
                  </form>
                )}

                <InteractionBar likes={item.likes} comments={item.comments} itemId={item.id} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
