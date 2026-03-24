"use client";

import { useState } from "react";

type TierKey = "jardin" | "salon" | "alcoba";

const tierLabels: Record<TierKey, string> = {
  jardin: "🌿 Jardín",
  salon: "🪞 Salón",
  alcoba: "🗝️ Alcoba",
};

const tierColors: Record<TierKey, string> = {
  jardin: "tier-jardin",
  salon: "tier-salon",
  alcoba: "tier-alcoba",
};

const initialMessages = [
  { id: "msg-001", from: "luna_dreams", subject: "loved the new drop!", preview: "Hey Ari! The velvet night director cut was incredible, the alternate score...", receivedAt: "Today, 4:12 PM", read: false, tier: "alcoba" as TierKey, aiReplied: false },
  { id: "msg-002", from: "velvet_rose", subject: "request: more terrace content?", preview: "Hi! I was wondering if you could do more live sessions on the terrace...", receivedAt: "Today, 2:45 PM", read: false, tier: "salon" as TierKey, aiReplied: false },
  { id: "msg-003", from: "midnight_sky", subject: "quick question about prints", preview: "Are the hacienda prints available in larger sizes? I want to frame...", receivedAt: "Today, 11:30 AM", read: true, tier: "jardin" as TierKey, aiReplied: true, aiReplyNote: "Auto-replied after 15m" },
  { id: "msg-004", from: "golden_dusk", subject: "thank you 🌿", preview: "Just wanted to say this community is everything. The hacienda feels like...", receivedAt: "Yesterday, 9:18 PM", read: true, tier: "alcoba" as TierKey, aiReplied: false },
  { id: "msg-005", from: "terrace_nights", subject: "voice note reply", preview: "▓▓▓░░░░░░░ 0:28", receivedAt: "Yesterday, 6:02 PM", read: true, tier: "salon" as TierKey, aiReplied: true, aiReplyNote: "Auto-replied after 30m" },
  { id: "msg-006", from: "amber_light", subject: "collab idea", preview: "I'm a photographer based in Barcelona and I had this idea for a joint...", receivedAt: "Mar 22, 5:44 PM", read: true, tier: "jardin" as TierKey, aiReplied: false },
  { id: "msg-007", from: "blossom_fan", subject: "how do you stay inspired?", preview: "Your content always feels so genuine. What keeps you motivated to create...", receivedAt: "Mar 21, 3:20 PM", read: true, tier: "salon" as TierKey, aiReplied: false },
  { id: "msg-008", from: "sunset_watcher", subject: "will there be a spring collection?", preview: "I absolutely loved the winter set. Are you planning something for spring?...", receivedAt: "Mar 20, 12:45 PM", read: true, tier: "jardin" as TierKey, aiReplied: true, aiReplyNote: "Auto-replied after 20m" },
];

export default function InboxPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiDelay, setAiDelay] = useState(15);
  const [filterTier, setFilterTier] = useState<"all" | TierKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const filtered = filterTier === "all" ? messages : messages.filter((m) => m.tier === filterTier);
  const unread = messages.filter((m) => !m.read).length;
  const selected = messages.find((m) => m.id === selectedId);

  function openMessage(id: string) {
    setSelectedId(id);
    setReply("");
    setSent(false);
    setMobileView("detail");
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: true } : m))
    );
  }

  function goBackToList() {
    setSelectedId(null);
    setMobileView("list");
  }

  function sendReply() {
    if (!reply.trim()) return;
    setSent(true);
    setReply("");
    setTimeout(() => {
      setSent(false);
    }, 2000);
  }

  return (
    <section className="cr-page">
      <p className="eyebrow">Inbox</p>
      <h1 className="section-title">Message Center</h1>

      {/* ── AI Auto-Reply Controls ────────────────────────── */}
      <div className="cr-ai-controls">
        <div className="cr-ai-toggle-row">
          <span className="cr-ai-label">🤖 AI Auto-Reply</span>
          <button
            className={`cr-toggle ${aiEnabled ? "on" : ""}`}
            onClick={() => setAiEnabled(!aiEnabled)}
          >
            <span className="cr-toggle-thumb" />
          </button>
          <span className={`cr-ai-status ${aiEnabled ? "active" : ""}`}>{aiEnabled ? "Active" : "Off"}</span>
        </div>
        <div className={`cr-ai-settings-panel ${aiEnabled ? "open" : ""}`}>
          <div className="cr-ai-delay-row">
            <span>Reply after</span>
            <select
              value={aiDelay}
              onChange={(e) => setAiDelay(Number(e.target.value))}
              className="cr-ai-select"
            >
              <option value={5}>5 min</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
            <span className="cr-ai-hint">if no manual reply is sent</span>
          </div>
        </div>
      </div>

      {/* ── Filter tabs ───────────────────────────────────── */}
      <div className="cr-tabs">
        <button className={`cr-tab ${filterTier === "all" ? "active" : ""}`} onClick={() => setFilterTier("all")}>
          All ({messages.length}) {unread > 0 && <span className="cr-unread-dot" />}
        </button>
        {(["alcoba", "salon", "jardin"] as TierKey[]).map((t) => (
          <button
            key={t}
            className={`cr-tab ${filterTier === t ? "active" : ""}`}
            onClick={() => setFilterTier(t)}
          >
            {tierLabels[t]}
          </button>
        ))}
      </div>

      <div className="cr-inbox-layout">
        {/* ── Message list ──────────────────────────────────── */}
        <div className={`cr-inbox-list ${mobileView === "detail" ? "mobile-hidden" : ""}`}>
          {filtered.map((msg, i) => (
            <button
              key={msg.id}
              className={`cr-inbox-item ${!msg.read ? "unread" : ""} ${selectedId === msg.id ? "selected" : ""} ${tierColors[msg.tier]}`}
              onClick={() => openMessage(msg.id)}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="cr-inbox-item-top">
                <span className="cr-inbox-from">@{msg.from}</span>
                <span className={`cr-inbox-tier-badge ${tierColors[msg.tier]}`}>
                  {tierLabels[msg.tier]}
                </span>
              </div>
              <div className="cr-inbox-subject">{msg.subject}</div>
              <div className="cr-inbox-preview">{msg.preview}</div>
              <div className="cr-inbox-item-bottom">
                <span className="timestamp">{msg.receivedAt}</span>
                {msg.aiReplied && <span className="cr-ai-badge">🤖 {msg.aiReplyNote}</span>}
              </div>
            </button>
          ))}
        </div>

        {/* ── Message detail ────────────────────────────────── */}
        <div className={`cr-inbox-detail ${mobileView === "list" ? "mobile-hidden" : ""} ${selected ? "has-message" : ""}`}>
          {selected ? (
            <div className="cr-inbox-detail-inner">
              <button className="cr-inbox-back" onClick={goBackToList}>← Back</button>
              <div className="cr-inbox-detail-header">
                <h3>{selected.subject}</h3>
                <div className="cr-inbox-detail-meta">
                  <span className="cr-inbox-from">@{selected.from}</span>
                  <span className={`cr-inbox-tier-badge ${tierColors[selected.tier]}`}>
                    {tierLabels[selected.tier]}
                  </span>
                  <span className="timestamp">{selected.receivedAt}</span>
                </div>
              </div>
              <div className="cr-inbox-detail-body">
                <p>{selected.preview}</p>
                {selected.aiReplied && (
                  <div className="cr-ai-reply-card">
                    <span className="cr-ai-reply-label">🤖 AI Auto-Reply sent</span>
                    <p>Thank you so much for your message! I appreciate you reaching out. I&apos;ll get back to you personally as soon as I can. In the meantime, check out the latest content in El Jardín! 🌿</p>
                    <span className="timestamp">{selected.aiReplyNote}</span>
                  </div>
                )}
              </div>
              <div className="cr-inbox-reply">
                <textarea
                  className="cr-inbox-textarea"
                  placeholder="Write a reply…"
                  rows={3}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <button
                  className={`primary-btn ${sent ? "sent" : ""}`}
                  onClick={sendReply}
                  disabled={sent}
                >
                  {sent ? "✓ Sent!" : "Send Reply"}
                </button>
              </div>
            </div>
          ) : (
            <div className="cr-inbox-empty">
              <span>💌</span>
              <p>Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
