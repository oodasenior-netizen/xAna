"use client";

import { useState } from "react";

const suggestions = [
  {
    category: "Content Strategy",
    icon: "📊",
    prompt: "What should I post this week?",
    response: "Based on your engagement data, personal posts perform 2.3× better on Tuesdays. Consider a behind-the-scenes shot from your next shoot. Your audience also responds strongly to golden hour content — schedule one for Thursday evening.",
  },
  {
    category: "Growth",
    icon: "📈",
    prompt: "How can I grow my subscriber count?",
    response: "Your Salón → Alcoba upgrade rate is 18% — above average. Focus on exclusive Bodega drops to incentivize upgrades. Consider a limited-time Alcoba perk like a personal voice note. Your La Terraza sessions drive the most new sign-ups.",
  },
  {
    category: "Pricing",
    icon: "💰",
    prompt: "Are my prices optimal?",
    response: "Your $7 PPV items have a 23% conversion rate, but $25 bundles convert at 8%. Consider a mid-tier at $14.99. Your subscription pricing is competitive — El Jardín at $14/mo is in the sweet spot for your niche.",
  },
  {
    category: "Engagement",
    icon: "💬",
    prompt: "How do I boost engagement?",
    response: "Your inbox open rate (81%) is excellent. Leverage it with weekly voice notes — they have 3× the reply rate of text. Pin a personal post every Monday. Consider 'Ask Me Anything' sessions on La Terraza monthly.",
  },
  {
    category: "Revenue",
    icon: "🏦",
    prompt: "Revenue optimization tips?",
    response: "Tips make up only 5% of revenue. Promote the Offering page more during live sessions — creators who mention tips 2-3 times per stream see 40% higher tip revenue. Your Fuego ($50) tier is underused; try a thank-you shoutout incentive.",
  },
  {
    category: "Scheduling",
    icon: "📅",
    prompt: "Best times to post?",
    response: "Your peak engagement window is 7-10 PM on weekdays and 2-5 PM on weekends. Friday drops perform 35% better than other days. Avoid posting before noon — your audience engagement is lowest between 6-11 AM.",
  },
];

type ChatMsg = {
  role: "user" | "ai";
  text: string;
};

export default function ConsultantPage() {
  const [chat, setChat] = useState<ChatMsg[]>([
    { role: "ai", text: "Hola! 🌿 I'm your Hacienda Consultant AI. Ask me anything about content strategy, growth, pricing, engagement, or revenue. You can also pick a suggestion below." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  function askQuestion(question: string) {
    const match = suggestions.find((s) => s.prompt === question);
    setChat((prev) => [...prev, { role: "user", text: question }]);
    setTyping(true);

    setTimeout(() => {
      const answer = match
        ? match.response
        : "That's a great question! Based on your current metrics, I'd recommend focusing on consistency — post at least once daily in El Jardín, schedule one Bodega drop per week, and go live on La Terraza every Saturday. Your engagement peaks in the evening, so time your posts accordingly. Want me to break this down further?";
      setChat((prev) => [...prev, { role: "ai", text: answer }]);
      setTyping(false);
    }, 1200);
  }

  function handleSend() {
    if (!input.trim()) return;
    askQuestion(input.trim());
    setInput("");
  }

  return (
    <section className="cr-page">
      <p className="eyebrow">AI Consultant</p>
      <h1 className="section-title">Hacienda Advisor</h1>

      {/* ── Quick suggestion pills ────────────────────────── */}
      <div className="cr-ai-suggestions">
        {suggestions.map((s) => (
          <button
            key={s.category}
            className="cr-ai-pill"
            onClick={() => askQuestion(s.prompt)}
          >
            <span>{s.icon}</span> {s.category}
          </button>
        ))}
      </div>

      {/* ── Chat window ───────────────────────────────────── */}
      <div className="cr-chat-window">
        <div className="cr-chat-messages">
          {chat.map((msg, i) => (
            <div key={i} className={`cr-chat-bubble ${msg.role}`}>
              {msg.role === "ai" && <span className="cr-chat-avatar">🤖</span>}
              <div className="cr-chat-text">{msg.text}</div>
              {msg.role === "user" && <span className="cr-chat-avatar">👩‍🎤</span>}
            </div>
          ))}
          {typing && (
            <div className="cr-chat-bubble ai">
              <span className="cr-chat-avatar">🤖</span>
              <div className="cr-chat-text typing">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}
        </div>

        <div className="cr-chat-input-row">
          <input
            type="text"
            className="cr-chat-input"
            placeholder="Ask me anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="primary-btn" onClick={handleSend}>Send</button>
        </div>
      </div>
    </section>
  );
}
