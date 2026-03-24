import { requireSubscriber } from "@/lib/guards";
import { getSessionFromCookies } from "@/lib/auth";
import { scrollThreads } from "@/lib/content";

export default async function ScrollPage() {
  await requireSubscriber();

  return (
    <section className="scroll-page">
      <h1 className="section-title">The Scroll</h1>
      <p className="eyebrow">Private letters between you and the host</p>

      <div className="scroll-threads">
        {scrollThreads.map((t) => (
          <article key={t.id} className="scroll-thread">
            <div className="scroll-thread-icon">
              {t.ppv ? "✉️" : "📜"}
            </div>
            <div className="scroll-thread-body">
              <h3>{t.subject}</h3>
              <p>{t.preview}</p>
              <span className="timestamp">{t.timestamp}</span>
            </div>
            <span
              className={`scroll-badge ${t.ppv ? "sealed" : "opened"}`}
            >
              {t.ppv ? "Sealed" : "Opened"}
            </span>
          </article>
        ))}
      </div>

      {/* ── Compose area ──────────────────────────────────── */}
      <div className="scroll-compose">
        <textarea
          className="scroll-textarea"
          placeholder="Write a letter…"
          rows={3}
          readOnly
        />
        <button className="temple-cta" disabled>
          Send Scroll ✉️
        </button>
      </div>
    </section>
  );
}
