import type { AppSession } from "@/lib/auth";

/* ── Access & mood types ─────────────────────────────── */

export type AccessMode = "subscription" | "ppv" | "one-time";
export type MoodTag = "Exclusive" | "BTS" | "Personal" | "PPV" | "Drop" | "Live";

export type ContentItem = {
  id: string;
  title: string;
  description: string;
  mood: MoodTag;
  access: AccessMode;
  priceCents?: number;
  pinned?: boolean;
  /** gradient placeholder colours for thumbnails */
  thumb: [string, string];
  /** fake engagement numbers */
  likes?: number;
  comments?: number;
  postedAt?: string;
};

export type ScrollThread = {
  id: string;
  subject: string;
  preview: string;
  timestamp: string;
  ppv?: boolean;
  priceCents?: number;
  voice?: boolean;
};

/* ── Creator identity ─────────────────────────────────── */

export const creatorProfile = {
  name: "Ari Voss",
  tagline: "Welcome to the estate. Stay as long as you like.",
  memberCount: "4,200",
  bio: "Warm nights, golden light, and stories told only behind closed doors. Exclusive visuals, intimate moments, and premium drops from inside the hacienda.",
  teaserLines: [
    "Daily posts in El Jardín — personal, intimate, real",
    "Private reserves locked in La Bodega",
    "Live evenings on La Terraza with real-time tipping",
    "Sealed letters and voice notes just for you",
  ],
  collageQuotes: [
    { text: "\"Every photo is a confession.\"", label: "Philosophy" },
    { text: "\"I built this place so you could see what I don't show anyone else.\"", label: "Bio" },
    { text: "\"Golden hour is a state of mind.\"", label: "Saying" },
    { text: "Born somewhere warm. Lives in the light.", label: "About" },
    { text: "\"The best things happen after sunset.\"", label: "Mood" },
    { text: "🌺 Orange blossoms & terracotta dreams", label: "Aesthetic" },
  ],
};

/* ── 3-tier pricing (named after rooms) ───────────────── */

export const pricingPlans = [
  {
    id: "monthly" as const,
    label: "El Jardín",
    subtitle: "The Garden",
    price: "$14",
    period: "/mo",
    perks: ["El Jardín feed access", "The Scroll messages", "Basic Bodega browsing"],
    highlight: false,
  },
  {
    id: "quarterly" as const,
    label: "El Salón",
    subtitle: "The Salon",
    price: "$35",
    period: "/3 mo",
    perks: ["Everything in Jardín", "Priority Terraza access", "1 bonus Bodega unlock"],
    highlight: false,
  },
  {
    id: "yearly" as const,
    label: "La Alcoba",
    subtitle: "The Inner Chamber",
    price: "$129",
    period: "/yr",
    perks: ["Everything above", "3 bonus Bodega unlocks", "Founders key", "Loyalty 2× points"],
    highlight: true,
  },
];

/* ── El Jardín Feed posts ─────────────────────────────── */

export const feedItems: ContentItem[] = [
  {
    id: "feed-golden-hour",
    title: "Golden Hour on the Terrace",
    description: "Caught this light just before the sun dipped behind the hills. No filter, just warmth.",
    mood: "Personal",
    access: "subscription",
    pinned: true,
    thumb: ["#8b5e3c", "#3d2a1e"],
    likes: 342,
    comments: 28,
    postedAt: "2 hours ago",
  },
  {
    id: "feed-bts-courtyard",
    title: "Behind the Courtyard Shoot",
    description: "How we turned an old stone wall into the backdrop for the new collection.",
    mood: "BTS",
    access: "subscription",
    thumb: ["#6b4423", "#2e1e15"],
    likes: 218,
    comments: 15,
    postedAt: "Yesterday",
  },
  {
    id: "feed-velvet-night",
    title: "Velvet Night (Extended Cut)",
    description: "The full uncut reel from the candlelit evening session.",
    mood: "PPV",
    access: "ppv",
    priceCents: 700,
    thumb: ["#5c2e1a", "#1a0f0a"],
    likes: 189,
    comments: 42,
    postedAt: "2 days ago",
  },
  {
    id: "feed-blossom-reel",
    title: "Orange Blossom Reel",
    description: "A 60-second cinematic that premiered here first. Floral, warm, intimate.",
    mood: "Exclusive",
    access: "subscription",
    thumb: ["#a0522d", "#3d2a1e"],
    likes: 456,
    comments: 37,
    postedAt: "3 days ago",
  },
  {
    id: "feed-personal-letter",
    title: "A Note from the Hacienda",
    description: "Personal update on what's coming next — and a small thank-you to everyone here.",
    mood: "Personal",
    access: "subscription",
    thumb: ["#704214", "#241710"],
    likes: 523,
    comments: 61,
    postedAt: "4 days ago",
  },
];

/* ── La Bodega (Vault) items ──────────────────────────── */

export const vaultItems: ContentItem[] = [
  {
    id: "vault-velvet-night",
    title: "Velvet Night (Director Cut)",
    description: "Extended cut with commentary and alternate score.",
    mood: "PPV",
    access: "ppv",
    priceCents: 700,
    thumb: ["#5c2e1a", "#1a0f0a"],
    likes: 189,
    comments: 42,
  },
  {
    id: "vault-hacienda-prints",
    title: "Hacienda Print Collection",
    description: "High-res printable stills from the terracotta series.",
    mood: "Exclusive",
    access: "one-time",
    priceCents: 1900,
    thumb: ["#8b4513", "#3d1c02"],
    likes: 134,
    comments: 19,
  },
  {
    id: "vault-siesta-pack",
    title: "La Siesta Film Pack",
    description: "Mini-film, poster pack, and ambient audio stems.",
    mood: "Drop",
    access: "one-time",
    priceCents: 2500,
    thumb: ["#704214", "#2e1e15"],
    likes: 267,
    comments: 33,
  },
  {
    id: "vault-moonlit-garden",
    title: "Moonlit Garden Session",
    description: "Exclusive PPV scene from the late-night garden series.",
    mood: "PPV",
    access: "ppv",
    priceCents: 1200,
    thumb: ["#3d2a1e", "#1a0f0a"],
    likes: 198,
    comments: 24,
  },
  {
    id: "vault-terraza-replay",
    title: "La Terraza Live Replay",
    description: "Full replay of the 2-hour live session under the stars.",
    mood: "Live",
    access: "ppv",
    priceCents: 900,
    thumb: ["#6b3410", "#1a0d01"],
    likes: 312,
    comments: 56,
  },
  {
    id: "vault-blossom-collection",
    title: "Orange Blossom Collection",
    description: "Curated photo set from the spring estate shoot.",
    mood: "Exclusive",
    access: "one-time",
    priceCents: 1500,
    thumb: ["#a0522d", "#5c3a2a"],
    likes: 245,
    comments: 29,
  },
];

/* ── Scroll (DM) threads ─────────────────────────────── */

export const scrollThreads: ScrollThread[] = [
  {
    id: "dm-welcome",
    subject: "Bienvenido — welcome to the hacienda",
    preview: "Thanks for stepping through the gate. Your first private gallery is unlocked.",
    timestamp: "Today, 3:42 PM",
  },
  {
    id: "dm-ppv-teaser",
    subject: "Something waiting for you in La Bodega",
    preview: "A sealed preview — just for you…",
    timestamp: "Yesterday, 11:18 PM",
    ppv: true,
    priceCents: 500,
  },
  {
    id: "dm-voice-note",
    subject: "Voice note — evening on the terrace",
    preview: "▓▓▓░░░░░░░ 0:42",
    timestamp: "Mar 21, 8:30 PM",
    voice: true,
    ppv: true,
    priceCents: 300,
  },
  {
    id: "dm-update",
    subject: "Live on La Terraza this Saturday",
    preview: "Mark your calendar — the terrace opens at 9 PM.",
    timestamp: "Mar 20, 2:15 PM",
  },
];

/* ── Tip tiers for The Offering ──────────────────────── */

export const tipTiers = [
  { id: "tip-small", label: "Flor", amountCents: 500, emoji: "🌸" },
  { id: "tip-medium", label: "Vino", amountCents: 1500, emoji: "🍷" },
  { id: "tip-large", label: "Fuego", amountCents: 5000, emoji: "🔥" },
];

/* ── Helpers ──────────────────────────────────────────── */

export function priceLabel(priceCents?: number) {
  if (!priceCents) return "Included";
  return `$${(priceCents / 100).toFixed(2)}`;
}

export function canAccessContent(session: AppSession | null, item: ContentItem) {
  if (!session) return false;
  if (session.role === "creator") return true;
  if (item.access === "subscription") return true;
  return session.ownedContent.includes(item.id);
}

export function tierBadge(plan: string) {
  if (plan === "yearly") return "🗝️ La Alcoba";
  if (plan === "quarterly") return "🪞 El Salón";
  return "🌿 El Jardín";
}
