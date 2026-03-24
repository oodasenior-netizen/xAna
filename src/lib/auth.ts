import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "xana_auth";

export type UserRole = "subscriber" | "creator";

export type AppSession = {
  userId: string;
  role: UserRole;
  plan: "monthly" | "quarterly" | "yearly" | "creator";
  ownedContent: string[];
  loyaltyPoints: number;
  fanSince: number;
  issuedAt: number;
  expiresAt: number;
};

const encoder = new TextEncoder();

function getAuthSecret() {
  return process.env.AUTH_SECRET ?? "replace-this-dev-secret-in-env";
}

function toBase64Url(data: Uint8Array) {
  const binary = Array.from(data, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
}

async function signBytes(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return new Uint8Array(signature);
}

async function verifyBytes(data: string, signature: Uint8Array<ArrayBuffer>) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  return crypto.subtle.verify("HMAC", key, signature, encoder.encode(data));
}

export async function signSessionToken(payload: AppSession) {
  const payloadString = JSON.stringify(payload);
  const payloadEncoded = toBase64Url(encoder.encode(payloadString));
  const sigEncoded = toBase64Url(await signBytes(payloadEncoded));
  return `${payloadEncoded}.${sigEncoded}`;
}

export async function verifySessionToken(token: string) {
  const [payloadEncoded, sigEncoded] = token.split(".");

  if (!payloadEncoded || !sigEncoded) {
    return null;
  }

  const valid = await verifyBytes(payloadEncoded, fromBase64Url(sigEncoded));

  if (!valid) {
    return null;
  }

  try {
    const payloadRaw = new TextDecoder().decode(fromBase64Url(payloadEncoded));
    const parsed = JSON.parse(payloadRaw) as AppSession;

    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}
