/**
 * Bunny Storage Zone — server utilities.
 * All env vars are server-side only and NEVER exposed to the browser.
 *
 * Upload:   PUT https://storage.bunnycdn.com/{zone}/{path}  AccessKey header
 * Playback: Signed URL — SHA256(tokenKey + "/" + path + expires) + ?token=&expires=
 * Delete:   DELETE https://storage.bunnycdn.com/{zone}/{path}  AccessKey header
 *
 * Region overrides (BUNNY_STORAGE_REGION env var):
 *   ny | la | sg | se | br | jh — set to the region of your storage zone
 */

const ZONE = process.env.BUNNY_STORAGE_ZONE ?? "";
const STORAGE_KEY = process.env.BUNNY_STORAGE_KEY ?? "";
const CDN_HOST =
  process.env.BUNNY_STORAGE_CDN_HOST ?? `${ZONE}.b-cdn.net`;
const TOKEN_KEY = process.env.BUNNY_TOKEN_KEY ?? "";
const REGION = process.env.BUNNY_STORAGE_REGION ?? "";

const STORAGE_BASE = REGION
  ? `https://${REGION}.storage.bunnycdn.com`
  : "https://storage.bunnycdn.com";

// ─── Upload ──────────────────────────────────────────────────────────────────

/**
 * Upload a file buffer to Bunny Storage.
 * @param fileBuffer  Raw bytes (ArrayBuffer)
 * @param storageKey  Path within the zone, e.g. "vault/item123/video.mp4"
 * @param contentType MIME type, e.g. "video/mp4"
 */
export async function uploadToBunnyStorage(
  fileBuffer: ArrayBuffer,
  storageKey: string,
  contentType: string
): Promise<void> {
  const url = `${STORAGE_BASE}/${ZONE}/${storageKey}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: STORAGE_KEY,
      "Content-Type": contentType || "application/octet-stream",
    },
    body: fileBuffer,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => String(res.status));
    throw new Error(`Bunny Storage upload failed: ${res.status} — ${text}`);
  }
}

// ─── Signed playback URL ─────────────────────────────────────────────────────

/**
 * Generate a short-lived signed CDN URL for secure file delivery.
 *
 * Token algorithm:  SHA256(tokenKey + "/" + storageKey + expiryTimestamp)
 * Uses Web Crypto API — compatible with Node.js 18+ and Edge Runtime.
 */
export async function signStorageUrl(
  storageKey: string,
  expiresInSeconds = 7200
): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  // Path must begin with "/" for token calculation
  const urlPath = storageKey.startsWith("/") ? storageKey : `/${storageKey}`;

  const raw = TOKEN_KEY + urlPath + expires.toString();
  const encoded = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);

  // Bunny CDN expects base64url-encoded token (not hex)
  const bytes = new Uint8Array(hashBuffer);
  const base64 = btoa(String.fromCharCode(...bytes));
  const token = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `https://${CDN_HOST}${urlPath}?token=${token}&expires=${expires}`;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/** Remove a file from Bunny Storage (best-effort — does not throw on 404). */
export async function deleteFromBunnyStorage(storageKey: string): Promise<void> {
  const url = `${STORAGE_BASE}/${ZONE}/${storageKey}`;
  await fetch(url, {
    method: "DELETE",
    headers: { AccessKey: STORAGE_KEY },
  }).catch(() => {});
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a sanitized storage key for a vault item.
 * Output:  vault/{vaultItemId}/{safe-filename}
 */
export function buildStorageKey(vaultItemId: string, filename: string): string {
  const safe = filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^_+/, "")
    .slice(0, 120);
  return `vault/${vaultItemId}/${safe || "media"}`;
}
