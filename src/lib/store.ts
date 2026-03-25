/**
 * xAna persistent store — file-backed JSON, seeded from static content.
 * Uses os.tmpdir() so it works on both Windows (dev) and Vercel (prod).
 * If Supabase is configured, feed/vault state is persisted in Postgres.
 */
import fs from "fs";
import path from "path";
import os from "os";
import { feedItems, vaultItems } from "./content";

export type MoodTag = "Exclusive" | "BTS" | "Personal" | "PPV" | "Drop" | "Live";
export type AccessMode = "subscription" | "ppv" | "one-time";
export type MediaStatus = "listed" | "unlisted" | "scheduled" | "stored";
export type MediaType = "video" | "audio" | "photo" | "bundle" | "text";

export type StoredPost = {
  id: string;
  title: string;
  description: string;
  mood: MoodTag;
  access: AccessMode;
  priceCents?: number;
  thumb: [string, string];
  likes: number;
  comments: number;
  postedAt: string;
  pinned?: boolean;
  videoUrl?: string;
  storageKey?: string;
  type?: MediaType;
};

export type StoredVaultItem = {
  id: string;
  title: string;
  description: string;
  mood: MoodTag;
  access: AccessMode;
  priceCents?: number;
  thumb: [string, string];
  likes: number;
  comments: number;
  videoUrl?: string;
  type?: MediaType;
  // Bunny Storage Zone
  storageKey?: string;         // Path in Bunny Storage Zone, e.g. "vault/item-id/video.mp4"
  // Creator-side metadata
  status: MediaStatus;
  fileSize?: string;
  uploadedAt?: string;
  scheduledFor?: string;
  views: number;
  purchases: number;
};

export type AppStore = {
  feedPosts: StoredPost[];
  vaultItems: StoredVaultItem[];
};

const STORE_PATH = path.join(os.tmpdir(), "xana-store.json");
const SUPABASE_TABLE = "xana_app_store";
const SUPABASE_ROW_ID = "main";

function getSupabaseConfig() {
  const url = (process.env.SUPABASE_URL ?? "").trim();
  const key =
    (process.env.SUPABASE_SECRET_KEY ?? "").trim() ||
    (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

  if (!url || !key) return null;
  return { url, key };
}

function isStoreLike(value: unknown): value is AppStore {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.feedPosts) && Array.isArray(v.vaultItems);
}

function defaultStore(): AppStore {
  return {
    feedPosts: feedItems.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      mood: i.mood as MoodTag,
      access: i.access as AccessMode,
      priceCents: i.priceCents,
      thumb: i.thumb,
      likes: i.likes ?? 0,
      comments: i.comments ?? 0,
      postedAt: i.postedAt ?? "Recently",
      pinned: i.pinned,
      videoUrl: i.videoUrl,
      type: i.type as MediaType | undefined,
    })),
    vaultItems: vaultItems.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      mood: i.mood as MoodTag,
      access: i.access as AccessMode,
      priceCents: i.priceCents,
      thumb: i.thumb,
      likes: i.likes ?? 0,
      comments: i.comments ?? 0,
      videoUrl: i.videoUrl,
      type: i.type as MediaType | undefined,
      status: "listed" as MediaStatus,
      views: 0,
      purchases: 0,
    })),
  };
}

function readFileStore(): AppStore {
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return isStoreLike(parsed) ? parsed : defaultStore();
  } catch {
    return defaultStore();
  }
}

function writeFileStore(data: AppStore): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[xana-store] write error:", err);
  }
}

async function readSupabaseStore(): Promise<AppStore | null> {
  const cfg = getSupabaseConfig();
  if (!cfg) return null;

  const endpoint = `${cfg.url}/rest/v1/${SUPABASE_TABLE}?id=eq.${SUPABASE_ROW_ID}&select=data&limit=1`;
  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      Accept: "application/json",
    },
    cache: "no-store",
  }).catch(() => null);

  if (!res || !res.ok) return null;
  const rows = (await res.json().catch(() => [])) as Array<{ data?: unknown }>;
  if (!rows.length || !isStoreLike(rows[0]?.data)) return null;
  return rows[0].data;
}

async function writeSupabaseStore(data: AppStore): Promise<void> {
  const cfg = getSupabaseConfig();
  if (!cfg) return;

  const endpoint = `${cfg.url}/rest/v1/${SUPABASE_TABLE}?on_conflict=id`;
  await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify([{ id: SUPABASE_ROW_ID, data, updated_at: new Date().toISOString() }]),
    cache: "no-store",
  }).catch(() => {});
}

export async function readStore(): Promise<AppStore> {
  const supabaseStore = await readSupabaseStore();
  if (supabaseStore) {
    writeFileStore(supabaseStore);
    return supabaseStore;
  }

  return readFileStore();
}

export async function writeStore(data: AppStore): Promise<void> {
  writeFileStore(data);
  await writeSupabaseStore(data);
}
