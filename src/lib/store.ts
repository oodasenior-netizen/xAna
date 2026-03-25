/**
 * xAna persistent store — file-backed JSON, seeded from static content.
 * Uses os.tmpdir() so it works on both Windows (dev) and Vercel (prod).
 * Data persists within the same warm Lambda / Node process instance.
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

export function readStore(): AppStore {
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(raw) as AppStore;
  } catch {
    return defaultStore();
  }
}

export function writeStore(data: AppStore): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[xana-store] write error:", err);
  }
}
