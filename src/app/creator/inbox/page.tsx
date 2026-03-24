"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Send, ChevronLeft, Bot, Clock, Circle, CheckCheck, Smile, Paperclip, MoreHorizontal, Phone, Video } from "lucide-react";

type TierKey = "jardin" | "salon" | "alcoba";

const tierColors: Record<TierKey, string> = {
  jardin: "#4ade80",
  salon: "#60a5fa",
  alcoba: "#c9a84c",
};

const initialMessages = [
  { id: "msg-001", from: "luna_dreams", avatar: "L", subject: "loved the new drop!", messages: [
    { sender: "them", text: "Hey! The velvet night director cut was incredible, the alternate score was amazing 🔥", time: "4:12 PM" },
    { sender: "them", text: "Any plans for more like that?", time: "4:12 PM" },
  ], receivedAt: "4:12 PM", read: false, tier: "alcoba" as TierKey, online: true },
  { id: "msg-002", from: "velvet_rose", avatar: "V", subject: "request: more terrace?", messages: [
    { sender: "them", text: "Hi! I was wondering if you could do more live sessions on the terrace. Those are my absolute favorite!", time: "2:45 PM" },
  ], receivedAt: "2:45 PM", read: false, tier: "salon" as TierKey, online: true },
  { id: "msg-003", from: "midnight_sky", avatar: "M", subject: "question about prints", messages: [
    { sender: "them", text: "Are the hacienda prints available in larger sizes? I want to frame the golden hour one.", time: "11:30 AM" },
    { sender: "me", text: "Yes! I can do custom sizes. DM me the dimensions you need and I'll send a quote 💛", time: "11:45 AM" },
    { sender: "them", text: "Amazing, thank you so much!", time: "11:50 AM" },
  ], receivedAt: "11:30 AM", read: true, tier: "jardin" as TierKey, online: false },
  { id: "msg-004", from: "golden_dusk", avatar: "G", subject: "thank you 🌿", messages: [
    { sender: "them", text: "Just wanted to say this community is everything. The content feels so personal and real.", time: "9:18 PM" },
  ], receivedAt: "Yesterday", read: true, tier: "alcoba" as TierKey, online: false },
  { id: "msg-005", from: "terrace_nights", avatar: "T", subject: "voice note reply", messages: [
    { sender: "them", text: "🎵 Voice note — 0:28", time: "6:02 PM" },
    { sender: "me", text: "Love this! Thanks for sharing 💜", time: "6:15 PM" },
  ], receivedAt: "Yesterday", read: true, tier: "salon" as TierKey, online: true },
  { id: "msg-006", from: "amber_light", avatar: "A", subject: "collab idea", messages: [
    { sender: "them", text: "I'm a photographer based in Barcelona and I had this idea for a joint creative project. Would you be interested?", time: "5:44 PM" },
  ], receivedAt: "Mar 22", read: true, tier: "jardin" as TierKey, online: false },
  { id: "msg-007", from: "blossom_fan", avatar: "B", subject: "how do you stay inspired?", messages: [
    { sender: "them", text: "Your content always feels so genuine. What keeps you motivated to create every day?", time: "3:20 PM" },
  ], receivedAt: "Mar 21", read: true, tier: "salon" as TierKey, online: false },
  { id: "msg-008", from: "sunset_watcher", avatar: "S", subject: "spring collection?", messages: [
    { sender: "them", text: "I absolutely loved the winter set. Are you planning something for spring? 🌸", time: "12:45 PM" },
    { sender: "me", text: "Big things coming! Stay tuned this week 👀", time: "1:00 PM" },
  ], receivedAt: "Mar 20", read: true, tier: "jardin" as TierKey, online: false },
];

export default function InboxPage() {
  const [conversations, setConversations] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selected = conversations.find((c) => c.id === selectedId);
  const filtered = searchQuery
    ? conversations.filter((c) => c.from.includes(searchQuery.toLowerCase()) || c.subject.includes(searchQuery.toLowerCase()))
    : conversations;
  const unread = conversations.filter((c) => !c.read).length;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages.length, selectedId]);

  function openChat(id: string) {
    setSelectedId(id);
    setMobileView("chat");
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, read: true } : c))
    );
  }

  function sendMessage() {
    if (!reply.trim() || !selectedId) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, messages: [...c.messages, { sender: "me", text: reply.trim(), time: timeStr }] }
          : c
      )
    );
    setReply("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <section className="messenger-shell">
      {/* ── Conversation List ──────────────────────────── */}
      <div className={`messenger-sidebar ${mobileView === "chat" ? "mobile-hidden" : ""}`}>
        <div className="messenger-sidebar-header">
          <h2>Messages</h2>
          {unread > 0 && <span className="messenger-unread-count">{unread}</span>}
        </div>

        <div className="messenger-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="messenger-list">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              className={`messenger-item ${selectedId === conv.id ? "active" : ""} ${!conv.read ? "unread" : ""}`}
              onClick={() => openChat(conv.id)}
            >
              <div className="messenger-avatar" style={{ background: tierColors[conv.tier] }}>
                {conv.avatar}
                {conv.online && <span className="messenger-online-dot" />}
              </div>
              <div className="messenger-item-content">
                <div className="messenger-item-top">
                  <span className="messenger-item-name">@{conv.from}</span>
                  <span className="messenger-item-time">{conv.receivedAt}</span>
                </div>
                <p className="messenger-item-preview">
                  {conv.messages[conv.messages.length - 1]?.sender === "me" && <CheckCheck size={12} />}
                  {conv.messages[conv.messages.length - 1]?.text}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat Area ──────────────────────────────────── */}
      <div className={`messenger-chat ${mobileView === "list" ? "mobile-hidden" : ""}`}>
        {selected ? (
          <>
            <div className="messenger-chat-header">
              <button className="messenger-back" onClick={() => setMobileView("list")}>
                <ChevronLeft size={20} />
              </button>
              <div className="messenger-chat-avatar" style={{ background: tierColors[selected.tier] }}>
                {selected.avatar}
                {selected.online && <span className="messenger-online-dot" />}
              </div>
              <div className="messenger-chat-info">
                <span className="messenger-chat-name">@{selected.from}</span>
                <span className="messenger-chat-status">
                  {selected.online ? "Active now" : "Offline"}
                </span>
              </div>
              <div className="messenger-chat-actions">
                <button title="Call"><Phone size={18} /></button>
                <button title="Video"><Video size={18} /></button>
                <button title="More"><MoreHorizontal size={18} /></button>
              </div>
            </div>

            <div className="messenger-messages">
              {selected.messages.map((msg, i) => (
                <div key={i} className={`messenger-bubble ${msg.sender === "me" ? "sent" : "received"}`}>
                  <p>{msg.text}</p>
                  <span className="messenger-bubble-time">
                    {msg.time}
                    {msg.sender === "me" && <CheckCheck size={12} />}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="messenger-compose">
              <button className="messenger-compose-btn" title="Attach"><Paperclip size={20} /></button>
              <div className="messenger-input-wrap">
                <textarea
                  placeholder="Type a message..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button className="messenger-compose-btn" title="Emoji"><Smile size={20} /></button>
              </div>
              <button
                className="messenger-send-btn"
                onClick={sendMessage}
                disabled={!reply.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="messenger-empty">
            <Bot size={48} />
            <h3>Select a conversation</h3>
            <p>Choose from your messages to start chatting</p>
          </div>
        )}
      </div>
    </section>
  );
}
