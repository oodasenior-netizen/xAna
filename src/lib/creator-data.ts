/* ═══════════════════════════════════════════════════════════
   Creator Portal — Static Data & Types
   All mock data powering the creator dashboard surfaces.
   ═══════════════════════════════════════════════════════════ */

/* ── Vault Media Types ────────────────────────────────── */

export type MediaStatus = "listed" | "unlisted" | "scheduled" | "stored";

export type VaultMedia = {
  id: string;
  title: string;
  description: string;
  status: MediaStatus;
  price: number;
  type: "photo" | "video" | "audio" | "bundle";
  fileSize: string;
  uploadedAt: string;
  scheduledFor?: string;
  views: number;
  purchases: number;
  revenue: number;
  thumb: [string, string];
};

export const vaultMediaItems: VaultMedia[] = [
  {
    id: "vm-velvet-night",
    title: "Velvet Night (Director Cut)",
    description: "Extended cut with commentary and alternate score.",
    status: "listed",
    price: 7.0,
    type: "video",
    fileSize: "2.4 GB",
    uploadedAt: "Mar 12, 2026",
    views: 1842,
    purchases: 189,
    revenue: 1323.0,
    thumb: ["#5c2e1a", "#1a0f0a"],
  },
  {
    id: "vm-hacienda-prints",
    title: "Hacienda Print Collection",
    description: "High-res printable stills from the terracotta series.",
    status: "listed",
    price: 19.0,
    type: "bundle",
    fileSize: "860 MB",
    uploadedAt: "Mar 8, 2026",
    views: 923,
    purchases: 134,
    revenue: 2546.0,
    thumb: ["#8b4513", "#3d1c02"],
  },
  {
    id: "vm-siesta-pack",
    title: "La Siesta Film Pack",
    description: "Mini-film, poster pack, and ambient audio stems.",
    status: "listed",
    price: 25.0,
    type: "bundle",
    fileSize: "4.1 GB",
    uploadedAt: "Mar 5, 2026",
    views: 1204,
    purchases: 267,
    revenue: 6675.0,
    thumb: ["#704214", "#2e1e15"],
  },
  {
    id: "vm-moonlit-unreleased",
    title: "Moonlit Terrace — Unreleased",
    description: "Full session from the unreleased terrace shoot. Awaiting color grade.",
    status: "unlisted",
    price: 12.0,
    type: "video",
    fileSize: "3.8 GB",
    uploadedAt: "Mar 18, 2026",
    views: 0,
    purchases: 0,
    revenue: 0,
    thumb: ["#3d2a1e", "#1a0f0a"],
  },
  {
    id: "vm-sunrise-set",
    title: "Sunrise Golden Hour Set",
    description: "Natural light photo set. 24 images, no edits.",
    status: "unlisted",
    price: 15.0,
    type: "photo",
    fileSize: "420 MB",
    uploadedAt: "Mar 20, 2026",
    views: 0,
    purchases: 0,
    revenue: 0,
    thumb: ["#a0522d", "#5c3a2a"],
  },
  {
    id: "vm-friday-drop",
    title: "Friday Night Drop — Vol. 4",
    description: "Exclusive content dropping this Friday at midnight.",
    status: "scheduled",
    price: 9.0,
    type: "video",
    fileSize: "1.9 GB",
    uploadedAt: "Mar 22, 2026",
    scheduledFor: "Mar 28, 2026 12:00 AM",
    views: 0,
    purchases: 0,
    revenue: 0,
    thumb: ["#8b5e3c", "#241710"],
  },
  {
    id: "vm-april-bundle",
    title: "April Hacienda Bundle",
    description: "Full month preview bundle. Photos, BTS, voice notes.",
    status: "scheduled",
    price: 35.0,
    type: "bundle",
    fileSize: "6.2 GB",
    uploadedAt: "Mar 23, 2026",
    scheduledFor: "Apr 1, 2026 9:00 AM",
    views: 0,
    purchases: 0,
    revenue: 0,
    thumb: ["#6b4423", "#2e1e15"],
  },
  {
    id: "vm-raw-archives",
    title: "RAW Archive — Jan–Feb 2026",
    description: "Unedited master files from the first two months.",
    status: "stored",
    price: 0,
    type: "bundle",
    fileSize: "48.6 GB",
    uploadedAt: "Feb 28, 2026",
    views: 0,
    purchases: 0,
    revenue: 0,
    thumb: ["#4a3020", "#1a0f0a"],
  },
  {
    id: "vm-audio-stems",
    title: "Audio Stems Collection Vol. 2",
    description: "Ambient soundscapes and music stems from recent sessions.",
    status: "stored",
    price: 0,
    type: "audio",
    fileSize: "8.3 GB",
    uploadedAt: "Mar 1, 2026",
    views: 0,
    purchases: 0,
    revenue: 0,
    thumb: ["#5c4a3e", "#241710"],
  },
];

/* ── Analytics Data ───────────────────────────────────── */

export const weeklyViews = [
  { day: "Mon", views: 1240 },
  { day: "Tue", views: 1580 },
  { day: "Wed", views: 1390 },
  { day: "Thu", views: 2100 },
  { day: "Fri", views: 2840 },
  { day: "Sat", views: 3200 },
  { day: "Sun", views: 2650 },
];

export const monthlyRevenue = [
  { month: "Oct", amount: 8400 },
  { month: "Nov", amount: 9200 },
  { month: "Dec", amount: 11800 },
  { month: "Jan", amount: 14200 },
  { month: "Feb", amount: 16800 },
  { month: "Mar", amount: 19400 },
];

export const topContent = [
  { title: "La Siesta Film Pack", revenue: 6675, purchases: 267 },
  { title: "Hacienda Print Collection", revenue: 2546, purchases: 134 },
  { title: "Velvet Night (Director Cut)", revenue: 1323, purchases: 189 },
  { title: "Orange Blossom Collection", revenue: 1845, purchases: 123 },
  { title: "Moonlit Garden Session", revenue: 1560, purchases: 130 },
];

export const engagementMetrics = {
  avgWatchTime: "6m 42s",
  feedCompletionRate: "72%",
  inboxOpenRate: "81%",
  liveAvgViewers: 342,
  tipConversion: "14.2%",
  returnRate: "68%",
};

export const subscriberGrowth = [
  { month: "Oct", subs: 2800 },
  { month: "Nov", subs: 3100 },
  { month: "Dec", subs: 3400 },
  { month: "Jan", subs: 3700 },
  { month: "Feb", subs: 3950 },
  { month: "Mar", subs: 4200 },
];

export const tierBreakdown = {
  jardin: { count: 2520, percentage: 60, label: "El Jardín" },
  salon: { count: 1176, percentage: 28, label: "El Salón" },
  alcoba: { count: 504, percentage: 12, label: "La Alcoba" },
};

/* ── Revenue & Payouts ────────────────────────────────── */

export const revenueBreakdown = {
  subscriptions: 12400,
  ppvSales: 4200,
  oneTimeSales: 1800,
  tips: 980,
  total: 19380,
};

export const payoutHistory = [
  { id: "po-001", date: "Mar 15, 2026", amount: 4200.0, status: "completed" as const, method: "Direct Deposit" },
  { id: "po-002", date: "Mar 1, 2026", amount: 3850.0, status: "completed" as const, method: "Direct Deposit" },
  { id: "po-003", date: "Feb 15, 2026", amount: 3600.0, status: "completed" as const, method: "Direct Deposit" },
  { id: "po-004", date: "Feb 1, 2026", amount: 3200.0, status: "completed" as const, method: "Wire Transfer" },
  { id: "po-005", date: "Jan 15, 2026", amount: 2900.0, status: "completed" as const, method: "Wire Transfer" },
];

export const payoutBalance = {
  available: 2480.0,
  pending: 1260.0,
  nextPayoutDate: "Apr 1, 2026",
  lifetimeEarnings: 82400.0,
};

/* ── Inbox / Messages ─────────────────────────────────── */

export type InboxMessage = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  receivedAt: string;
  read: boolean;
  tier: "jardin" | "salon" | "alcoba";
  aiAutoReply: boolean;
  aiRepliedAt?: string;
  expiresIn?: string;
};

export const inboxMessages: InboxMessage[] = [
  {
    id: "msg-001",
    from: "luna_dreams",
    subject: "loved the new drop!",
    preview: "Hey Ari! The velvet night director cut was incredible, the alternate score...",
    receivedAt: "Today, 4:12 PM",
    read: false,
    tier: "alcoba",
    aiAutoReply: false,
  },
  {
    id: "msg-002",
    from: "velvet_rose",
    subject: "request: more terrace content?",
    preview: "Hi! I was wondering if you could do more live sessions on the terrace...",
    receivedAt: "Today, 2:45 PM",
    read: false,
    tier: "salon",
    aiAutoReply: false,
  },
  {
    id: "msg-003",
    from: "midnight_sky",
    subject: "quick question about prints",
    preview: "Are the hacienda prints available in larger sizes? I want to frame...",
    receivedAt: "Today, 11:30 AM",
    read: true,
    tier: "jardin",
    aiAutoReply: true,
    aiRepliedAt: "Today, 11:45 AM",
    expiresIn: "Auto-replied after 15m",
  },
  {
    id: "msg-004",
    from: "golden_dusk",
    subject: "thank you 🌿",
    preview: "Just wanted to say this community is everything. The hacienda feels like...",
    receivedAt: "Yesterday, 9:18 PM",
    read: true,
    tier: "alcoba",
    aiAutoReply: false,
  },
  {
    id: "msg-005",
    from: "terrace_nights",
    subject: "voice note reply",
    preview: "▓▓▓░░░░░░░ 0:28",
    receivedAt: "Yesterday, 6:02 PM",
    read: true,
    tier: "salon",
    aiAutoReply: true,
    aiRepliedAt: "Yesterday, 6:32 PM",
    expiresIn: "Auto-replied after 30m",
  },
  {
    id: "msg-006",
    from: "amber_light",
    subject: "collab idea",
    preview: "I'm a photographer based in Barcelona and I had this idea for a joint...",
    receivedAt: "Mar 22, 5:44 PM",
    read: true,
    tier: "jardin",
    aiAutoReply: false,
  },
];

/* ── Admin Data ───────────────────────────────────────── */

export type BlockedUser = {
  id: string;
  username: string;
  reason: string;
  blockedAt: string;
};

export const blockedUsers: BlockedUser[] = [
  { id: "blk-001", username: "toxic_troll_99", reason: "Harassment in comments", blockedAt: "Mar 18, 2026" },
  { id: "blk-002", username: "spam_bot_42", reason: "Spam messages", blockedAt: "Mar 10, 2026" },
];

export const reportQueue = [
  { id: "rpt-001", reporter: "luna_dreams", target: "shadow_lurker", reason: "Inappropriate comments", date: "Today, 1:30 PM" },
  { id: "rpt-002", reporter: "velvet_rose", target: "anon_998", reason: "Unsolicited DMs", date: "Yesterday, 4:15 PM" },
  { id: "rpt-003", reporter: "golden_dusk", target: "creep_acct", reason: "Impersonation attempt", date: "Mar 21, 11:00 AM" },
];

export const adminStats = {
  totalSubscribers: 4200,
  activeToday: 1842,
  newSignupsWeek: 168,
  churnRate: "2.1%",
  flaggedContent: 0,
  pendingReports: 3,
  blockedAccounts: 2,
  storageUsed: "386 GB",
  storageLimit: "500 GB",
};

/* ── Feed Post Types ──────────────────────────────────── */

export type FeedDraft = {
  id: string;
  title: string;
  body: string;
  status: "draft" | "published" | "scheduled";
  access: "subscription" | "ppv" | "one-time";
  price?: number;
  scheduledFor?: string;
  createdAt: string;
};

export const recentPosts: FeedDraft[] = [
  {
    id: "post-001",
    title: "Golden Hour on the Terrace",
    body: "Caught this light just before the sun dipped behind the hills. No filter, just warmth.",
    status: "published",
    access: "subscription",
    createdAt: "2 hours ago",
  },
  {
    id: "post-002",
    title: "Behind the Courtyard Shoot",
    body: "How we turned an old stone wall into the backdrop for the new collection.",
    status: "published",
    access: "subscription",
    createdAt: "Yesterday",
  },
  {
    id: "post-003",
    title: "Velvet Night (Extended Cut)",
    body: "The full uncut reel from the candlelit evening session.",
    status: "published",
    access: "ppv",
    price: 7.0,
    createdAt: "2 days ago",
  },
  {
    id: "post-004",
    title: "Sneak Peek — April Bundle",
    body: "A little preview of what's coming next month. You're not ready.",
    status: "draft",
    access: "subscription",
    createdAt: "Today",
  },
  {
    id: "post-005",
    title: "Friday Night Drop Vol. 4",
    body: "Exclusive content dropping this Friday at midnight. Set your alarms.",
    status: "scheduled",
    access: "ppv",
    price: 9.0,
    scheduledFor: "Mar 28, 2026 12:00 AM",
    createdAt: "Mar 22",
  },
];

/* ── AI Consultant Prompts ────────────────────────────── */

export const aiSuggestions = [
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
