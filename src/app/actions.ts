"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  AUTH_COOKIE_NAME,
  type AppSession,
  getSessionFromCookies,
  signSessionToken,
} from "@/lib/auth";
import { feedItems, vaultItems } from "@/lib/content";
import { readStore, writeStore } from "@/lib/store";
import type { MoodTag, AccessMode, MediaStatus, MediaType } from "@/lib/store";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

function defaultOwnedContent() {
  return feedItems
    .filter((i) => i.access === "subscription")
    .map((i) => i.id);
}

async function writeSession(session: AppSession) {
  const token = await signSessionToken(session);
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export async function subscribeAndEnter(formData: FormData) {
  const plan = (formData.get("plan") as "monthly" | "quarterly" | "yearly") ?? "monthly";

  const session: AppSession = {
    userId: crypto.randomUUID(),
    role: "subscriber",
    plan,
    ownedContent: defaultOwnedContent(),
    loyaltyPoints: plan === "yearly" ? 200 : plan === "quarterly" ? 80 : 0,
    fanSince: Date.now(),
    issuedAt: Date.now(),
    expiresAt: Date.now() + THIRTY_DAYS * 1000,
  };

  await writeSession(session);
  redirect("/app/welcome");
}

export async function creatorLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const expectedEmail = (process.env.CREATOR_EMAIL ?? "creator").trim().toLowerCase();
  const expectedPassword = (process.env.CREATOR_PASSWORD ?? "ChangeThisCreatorPassword").trim();

  if (email !== expectedEmail || password !== expectedPassword) {
    redirect("/entry?error=bad-creator-login");
  }

  const session: AppSession = {
    userId: "creator",
    role: "creator",
    plan: "creator",
    ownedContent: [...feedItems, ...vaultItems].map((item) => item.id),
    loyaltyPoints: 0,
    fanSince: Date.now(),
    issuedAt: Date.now(),
    expiresAt: Date.now() + THIRTY_DAYS * 1000,
  };

  await writeSession(session);
  redirect("/creator");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  redirect("/entry");
}

export async function unlockContent(formData: FormData) {
  const contentId = String(formData.get("contentId") ?? "");
  const nextPath = String(formData.get("nextPath") ?? "/app");

  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/entry");
  }

  if (!contentId) {
    redirect(nextPath);
  }

  if (!session.ownedContent.includes(contentId)) {
    session.ownedContent.push(contentId);
  }

  await writeSession({
    ...session,
    loyaltyPoints: session.loyaltyPoints + 10,
    issuedAt: Date.now(),
    expiresAt: Date.now() + THIRTY_DAYS * 1000,
  });

  redirect(nextPath);
}

export async function sendTip(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/entry");

  const amountCents = Number(formData.get("amountCents") ?? 0);
  const points = Math.floor(amountCents / 100) * 5;

  await writeSession({
    ...session!,
    loyaltyPoints: session!.loyaltyPoints + points,
    issuedAt: Date.now(),
    expiresAt: Date.now() + THIRTY_DAYS * 1000,
  });

  redirect("/app/offering?sent=1");
}

/* ═══════════════════════════════════════════════════════════
   CREATOR PUBLISHING ACTIONS
   ═══════════════════════════════════════════════════════════ */

export async function creatorPublishPost(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") redirect("/entry");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const mood = String(formData.get("mood") ?? "Personal") as MoodTag;
  const access = String(formData.get("access") ?? "subscription") as AccessMode;
  const videoUrl = String(formData.get("videoUrl") ?? "").trim() || undefined;
  const mediaType = String(formData.get("mediaType") ?? "text") as MediaType;
  const priceCents =
    access !== "subscription" && formData.get("priceCents")
      ? Math.round(Number(formData.get("priceCents")) * 100)
      : undefined;

  if (!title || !description) redirect("/creator/feed?error=empty");

  const store = readStore();
  store.feedPosts.unshift({
    id: `feed-${Date.now()}`,
    title,
    description,
    mood,
    access,
    priceCents,
    thumb: ["#8b5e3c", "#241710"],
    likes: 0,
    comments: 0,
    postedAt: "Just now",
    pinned: false,
    videoUrl,
    type: mediaType,
  });
  writeStore(store);
  revalidatePath("/app");
  revalidatePath("/creator/feed");
  redirect("/creator/feed?published=1");
}

export async function creatorDeletePost(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") redirect("/entry");

  const postId = String(formData.get("postId") ?? "");
  const store = readStore();
  store.feedPosts = store.feedPosts.filter((p) => p.id !== postId);
  writeStore(store);
  revalidatePath("/app");
  revalidatePath("/creator/feed");
  redirect("/creator/feed");
}

export async function creatorPublishVaultItem(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") redirect("/entry");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const mood = String(formData.get("mood") ?? "PPV") as MoodTag;
  const access = String(formData.get("access") ?? "ppv") as AccessMode;
  const priceDollars = Number(formData.get("price") ?? 0);
  const priceCents = Math.round(priceDollars * 100) || undefined;
  const videoUrl = String(formData.get("videoUrl") ?? "").trim() || undefined;
  const mediaType = String(formData.get("mediaType") ?? "video") as MediaType;
  const status = String(formData.get("status") ?? "listed") as MediaStatus;
  const scheduledFor = String(formData.get("scheduledFor") ?? "").trim() || undefined;
  const storageKey = String(formData.get("storageKey") ?? "").trim() || undefined;

  if (!title) redirect("/creator/vault?error=empty");

  const store = readStore();
  store.vaultItems.unshift({
    id: `vault-${Date.now()}`,
    title,
    description,
    mood,
    access,
    priceCents,
    thumb: ["#5c2e1a", "#1a0f0a"],
    likes: 0,
    comments: 0,
    videoUrl,
    type: mediaType,
    storageKey,
    status,
    scheduledFor,
    views: 0,
    purchases: 0,
    uploadedAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  });
  writeStore(store);
  revalidatePath("/app/vault");
  revalidatePath("/creator/vault");
  redirect("/creator/vault?published=1");
}

export async function creatorUpdateVaultItem(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") redirect("/entry");

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceDollars = Number(formData.get("price") ?? 0);
  const status = String(formData.get("status") ?? "listed") as MediaStatus;
  const scheduledFor = String(formData.get("scheduledFor") ?? "").trim() || undefined;
  const videoUrl = String(formData.get("videoUrl") ?? "").trim() || undefined;
  const storageKey = String(formData.get("storageKey") ?? "").trim() || undefined;

  const store = readStore();
  store.vaultItems = store.vaultItems.map((item) =>
    item.id === id
      ? {
          ...item,
          title: title || item.title,
          description: description !== "" ? description : item.description,
          priceCents: priceDollars > 0 ? Math.round(priceDollars * 100) : item.priceCents,
          status,
          scheduledFor: status === "scheduled" ? scheduledFor : undefined,
          videoUrl: videoUrl !== undefined ? videoUrl || item.videoUrl : item.videoUrl,
          storageKey: storageKey ?? item.storageKey,
        }
      : item
  );
  writeStore(store);
  revalidatePath("/app/vault");
  revalidatePath("/creator/vault");
  redirect("/creator/vault?saved=1");
}

export async function creatorDeleteVaultItem(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") redirect("/entry");

  const itemId = String(formData.get("itemId") ?? "");
  const store = readStore();
  store.vaultItems = store.vaultItems.filter((i) => i.id !== itemId);
  writeStore(store);
  revalidatePath("/app/vault");
  revalidatePath("/creator/vault");
  redirect("/creator/vault");
}
