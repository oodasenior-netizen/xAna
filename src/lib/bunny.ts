/**
 * Bunny Stream server-side utilities.
 * All functions run exclusively on the server — env vars are NEVER exposed to the browser.
 *
 * API base:  https://video.bunnycdn.com
 * Auth:      AccessKey header  (BUNNY_API_KEY)
 * Library:   BUNNY_STREAM_ID
 * Token key: BUNNY_TOKENHASH  (for signed playback URLs)
 * CDN host:  BUNNY_HOSTNAME   (for thumbnail URLs)
 */
import crypto from "crypto";

const LIBRARY_ID = process.env.BUNNY_STREAM_ID ?? "";
const API_KEY = process.env.BUNNY_API_KEY ?? "";
const TOKEN_KEY = process.env.BUNNY_TOKENHASH ?? "";
const CDN_HOST = process.env.BUNNY_HOSTNAME ?? "";
const BASE = "https://video.bunnycdn.com";

// ─── Create & upload ──────────────────────────────────────────────────────────

/**
 * Creates a new video entry in the Bunny Stream library.
 * Returns the GUID of the created video (used as the videoId everywhere).
 */
export async function createBunnyVideo(title: string): Promise<string> {
  const res = await fetch(`${BASE}/library/${LIBRARY_ID}/videos`, {
    method: "POST",
    headers: {
      AccessKey: API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.status.toString());
    throw new Error(`Bunny create video failed: ${res.status} — ${text}`);
  }

  const data = (await res.json()) as { guid: string };
  if (!data.guid) throw new Error("Bunny response missing guid");
  return data.guid;
}

/**
 * Generates a TUS upload signature for direct browser → Bunny uploads.
 *
 * The client uses these credentials with tus-js-client to upload directly to
 * https://video.bunnycdn.com/tusupload without routing through our server.
 *
 * Signature algorithm: SHA256(libraryId + apiKey + expiry + videoId)
 */
export function signTusUpload(
  videoId: string,
  expiresInSeconds = 7200
): {
  videoId: string;
  signature: string;
  expiry: number;
  libraryId: string;
} {
  const expiry = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const raw = LIBRARY_ID + API_KEY + expiry.toString() + videoId;
  const signature = crypto.createHash("sha256").update(raw).digest("hex");
  return { videoId, signature, expiry, libraryId: LIBRARY_ID };
}

// ─── Secure playback ─────────────────────────────────────────────────────────

/**
 * Returns a short-lived signed iframe embed URL for token-authenticated playback.
 *
 * Token algorithm: SHA256(tokenKey + videoId + expiry)
 * Embed URL:       https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}?token=...&expires=...
 */
export function signPlaybackToken(
  videoId: string,
  expiresInSeconds = 7200
): {
  embedUrl: string;
  thumbnailUrl: string;
  expires: number;
} {
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const raw = TOKEN_KEY + videoId + expires.toString();
  const token = crypto.createHash("sha256").update(raw).digest("hex");

  const params = new URLSearchParams({
    token,
    expires: String(expires),
    autoplay: "true",
    loop: "false",
    muted: "false",
    preload: "true",
    responsive: "true",
  });

  const embedUrl = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?${params}`;
  const thumbnailUrl = getBunnyThumbnailUrl(videoId);
  return { embedUrl, thumbnailUrl, expires };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Public thumbnail URL (not secret — same CDN as the embed). */
export function getBunnyThumbnailUrl(videoId: string): string {
  return `https://${CDN_HOST}/${videoId}/thumbnail.jpg`;
}

/** Validates that a string looks like a Bunny Stream GUID (UUID format). */
export function isValidBunnyGuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
