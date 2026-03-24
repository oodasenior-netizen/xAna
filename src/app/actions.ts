"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AUTH_COOKIE_NAME,
  type AppSession,
  getSessionFromCookies,
  signSessionToken,
} from "@/lib/auth";
import { feedItems, vaultItems } from "@/lib/content";

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

  const expectedEmail = (process.env.CREATOR_EMAIL ?? "creator").toLowerCase();
  const expectedPassword = process.env.CREATOR_PASSWORD ?? "ChangeThisCreatorPassword";

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
