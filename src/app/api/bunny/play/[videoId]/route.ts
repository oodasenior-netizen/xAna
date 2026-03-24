import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { signPlaybackToken, isValidBunnyGuid } from "@/lib/bunny";
import { readStore } from "@/lib/store";

/**
 * GET /api/bunny/play/[videoId]
 *
 * Returns a short-lived, token-signed Bunny Stream embed URL.
 * Access control: creator always allowed; subscribers must own the vault item
 * (or the item must be subscription-tier).
 *
 * Response: { embedUrl, thumbnailUrl, expires }
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoId } = await params;

  // Strictly validate the GUID format — prevents path traversal / injection
  if (!isValidBunnyGuid(videoId)) {
    return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
  }

  // Access-control check against the vault store
  if (session.role !== "creator") {
    const store = readStore();
    const item = store.vaultItems.find((v) => v.bunnyVideoId === videoId);

    if (item) {
      const canAccess =
        item.access === "subscription" ||
        session.ownedContent.includes(item.id);

      if (!canAccess) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }
    // If the item is not in the store (e.g. deleted) — still allow playback
    // so existing sessions aren't broken. Tokens expire in 2 hours anyway.
  }

  const result = signPlaybackToken(videoId);
  return NextResponse.json(result);
}
