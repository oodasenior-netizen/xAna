/**
 * GET|HEAD /api/vault/stream?key={storageKey}
 *
 * Same-origin media streaming proxy for Bunny Storage Zone files.
 * - Verifies session + content access server-side
 * - Forwards Range requests for seek support
 * - Preserves playback headers required by <video>/<audio>
 * - Falls back to direct storage fetch when signed CDN fetch fails
 */
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { readStore } from "@/lib/store";
import { signStorageUrl, fetchFromBunnyStorage } from "@/lib/bunny-storage";

function isValidStorageKey(key: string): boolean {
  return (
    !!key &&
    (key.startsWith("vault/") || key.startsWith("feed/")) &&
    !key.includes("..") &&
    !key.includes("//")
  );
}

async function assertAccess(req: NextRequest, key: string): Promise<{ ok: true } | { ok: false; res: NextResponse }> {
  const session = await getSessionFromCookies();
  if (!session) {
    return { ok: false, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!isValidStorageKey(key)) {
    return { ok: false, res: NextResponse.json({ error: "Invalid storage key" }, { status: 400 }) };
  }

  if (session.role === "creator") {
    return { ok: true };
  }

  const store = await readStore();
  const vaultItem = store.vaultItems.find((v) => v.storageKey === key);
  if (vaultItem) {
    const canAccess = vaultItem.access === "subscription" || session.ownedContent.includes(vaultItem.id);
    if (!canAccess) {
      return { ok: false, res: NextResponse.json({ error: "Access denied" }, { status: 403 }) };
    }
    return { ok: true };
  }

  const feedPost = store.feedPosts.find((p) => p.storageKey === key);
  if (feedPost) {
    const canAccess = feedPost.access === "subscription" || session.ownedContent.includes(feedPost.id);
    if (!canAccess) {
      return { ok: false, res: NextResponse.json({ error: "Access denied" }, { status: 403 }) };
    }
  }

  return { ok: true };
}

function copyMediaHeaders(source: Headers, target: Headers) {
  const names = [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
    "etag",
    "last-modified",
  ];

  for (const name of names) {
    const value = source.get(name);
    if (value) target.set(name, value);
  }

  if (!target.has("accept-ranges")) {
    target.set("accept-ranges", "bytes");
  }
}

function inlineDispositionForKey(key: string): string {
  const raw = key.split("/").pop() || "media";
  const ascii = raw.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "");
  return `inline; filename="${ascii || "media"}"`;
}

async function proxy(req: NextRequest, method: "GET" | "HEAD") {
  const key = req.nextUrl.searchParams.get("key") ?? "";
  const auth = await assertAccess(req, key);
  if (!auth.ok) return auth.res;

  const range = req.headers.get("range");

  try {
    const signedUrl = await signStorageUrl(key, 1800);
    let upstream = await fetch(signedUrl, {
      method,
      headers: range ? { Range: range } : undefined,
      cache: "no-store",
    });

    // Fallback: fetch directly from storage API when signed CDN fetch fails.
    if ((!upstream.ok && upstream.status !== 206) || (method === "GET" && !upstream.body)) {
      upstream = await fetchFromBunnyStorage(key, {
        method,
        range: range ?? undefined,
      });
    }

    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json(
        { error: `Upstream media fetch failed (${upstream.status})` },
        { status: 502 }
      );
    }

    const headers = new Headers();
    copyMediaHeaders(upstream.headers, headers);
    headers.set("content-disposition", inlineDispositionForKey(key));
    headers.set("cache-control", "private, no-store");

    if (method === "HEAD") {
      return new NextResponse(null, { status: upstream.status, headers });
    }

    return new NextResponse(upstream.body, { status: upstream.status, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Streaming failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return proxy(req, "GET");
}

export async function HEAD(req: NextRequest) {
  return proxy(req, "HEAD");
}
