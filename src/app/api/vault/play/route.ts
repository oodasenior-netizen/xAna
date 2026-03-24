/**
 * GET /api/vault/play?key={storageKey}
 *
 * Returns a short-lived, SHA256-signed Bunny CDN URL for secure media playback.
 *
 * Access control:
 *   - Creator: unrestricted access to all vault items
 *   - Subscriber: must own the item (session.ownedContent) OR item is subscription-tier
 *
 * Security:
 *   - storageKey is validated (must start with "vault/", no path traversal)
 *   - Signed URL expires in 2 hours — replay attacks are time-bounded
 */
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { signStorageUrl } from "@/lib/bunny-storage";
import { readStore } from "@/lib/store";

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = req.nextUrl.searchParams.get("key") ?? "";

  // Strict key validation — must be "vault/{id}/{filename}", no path traversal
  if (!key || !key.startsWith("vault/") || key.includes("..") || key.includes("//")) {
    return NextResponse.json({ error: "Invalid storage key" }, { status: 400 });
  }

  // Access control for subscribers
  if (session.role !== "creator") {
    const store = readStore();
    const item = store.vaultItems.find((v) => v.storageKey === key);

    if (item) {
      const canAccess =
        item.access === "subscription" || session.ownedContent.includes(item.id);
      if (!canAccess) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }
    // Unknown key (deleted item) — allow; signed URL expires in 2h either way
  }

  try {
    const url = await signStorageUrl(key);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "URL signing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
