"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Send, ChevronLeft, CheckCheck, Smile, Paperclip, Star, Sparkles, Heart } from "lucide-react";

type Conversation = {
  id: string;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: boolean;
  online: boolean;
  verified: boolean;
  messages: { sender: "me" | "them"; text: string; time: string }[];
};

const initialConversations: Conversation[] = [
  {
    id: "c1",
    name: "Goddess Annaleese",
    avatar: "A",
    lastMsg: "Thank you for being here 💛",
    time: "Just now",
    unread: true,
    online: true,
    verified: true,
    messages: [
      { sender: "them", text: "Welcome to the inner circle. I'm so glad you're here 🌿", time: "10:00 AM" },
      { sender: "them", text: "Thank you for being here 💛", time: "10:01 AM" },
    ],
  },
  {
    id: "c2",
    name: "Goddess Annaleese",
    avatar: "A",
    lastMsg: "New exclusive drop coming Friday 🔥",
    time: "Yesterday",
    unread: false,
    online: true,
    verified: true,
    messages: [
      { sender: "them", text: "New exclusive drop coming Friday 🔥", time: "Yesterday" },
      { sender: "me", text: "Cannot wait! 😍", time: "Yesterday" },
      { sender: "them", text: "You're going to love it ✨", time: "Yesterday" },
    ],
  },
  {
    id: "c3",
    name: "Goddess Annaleese",
    avatar: "A",
    lastMsg: "Your loyalty tier has been upgraded",
    time: "Mar 20",
    unread: false,
    online: true,
    verified: true,
    messages: [
      { sender: "them", text: "Your loyalty tier has been upgraded 🏆", time: "Mar 20" },
      { sender: "them", text: "You now have access to the Golden Vault section.", time: "Mar 20" },
    ],
  },
];

export default function ScrollPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;
  const filtered = search
    ? conversations.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.lastMsg.toLowerCase().includes(search.toLowerCase()))
    : conversations;
  const unread = conversations.filter((c) => c.unread).length;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages.length, selectedId]);

  function openChat(id: string) {
    setSelectedId(id);
    setMobileView("chat");
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, unread: false } : c));
  }

  function sendMessage() {
    if (!reply.trim() || !selectedId) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, messages: [...c.messages, { sender: "me", text: reply.trim(), time: timeStr }], lastMsg: reply.trim() }
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
    <section className="messenger-shell sub-messenger">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <div className={`messenger-sidebar ${mobileView === "chat" ? "mobile-hidden" : ""}`}>
        <div className="messenger-sidebar-header">
          <h2>Messages</h2>
          {unread > 0 && <span className="messenger-unread-count">{unread}</span>}
        </div>
        <div className="messenger-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="messenger-list">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              className={`messenger-item ${selectedId === conv.id ? "active" : ""} ${conv.unread ? "unread" : ""}`}
              onClick={() => openChat(conv.id)}
            >
              <div className="messenger-avatar sub-avatar">
                {conv.avatar}
                {conv.online && <span className="messenger-online-dot" />}
              </div>
              <div className="messenger-item-content">
                <div className="messenger-item-top">
                  <span className="messenger-item-name">
                    {conv.name}
                    {conv.verified && <Star size={11} style={{ color: "var(--gold)", marginLeft: "4px" }} />}
                  </span>
                  <span className="messenger-item-time">{conv.time}</span>
                </div>
                <p className="messenger-item-preview">{conv.lastMsg}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat ────────────────────────────────────────── */}
      <div className={`messenger-chat ${mobileView === "list" ? "mobile-hidden" : ""}`}>
        {selected ? (
          <>
            <div className="messenger-chat-header">
              <button className="messenger-back" onClick={() => setMobileView("list")}>
                <ChevronLeft size={20} />
              </button>
              <div className="messenger-chat-avatar sub-avatar">
                {selected.avatar}
                {selected.online && <span className="messenger-online-dot" />}
              </div>
              <div className="messenger-chat-info">
                <span className="messenger-chat-name">
                  {selected.name}
                  {selected.verified && <Star size={12} style={{ color: "var(--gold)", marginLeft: "4px" }} />}
                </span>
                <span className="messenger-chat-status">{selected.online ? "Active now" : "Offline"}</span>
              </div>
              <div className="messenger-chat-actions">
                <button title="Like"><Heart size={18} /></button>
                <button title="Sparkle"><Sparkles size={18} /></button>
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
                  placeholder="Send a message..."
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
            <Sparkles size={48} />
            <h3>Your messages</h3>
            <p>Private conversations from Goddess Annaleese will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}

