/**
 * POST /api/vault/upload
 *
 * Creator-only. Receives a file via multipart/form-data and proxies it
 * directly to Bunny Storage using the server-side API key.
 *
 * Edge Runtime — no Vercel body-size limit on serverless functions.
 *
 * Request (multipart/form-data):
 *   file        — the media file
 *   vaultItemId — the ID used to namespace the storage path
 *
 * Response: { storageKey: string, size: number }
 */
export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { uploadToBunnyStorage, buildStorageKey } from "@/lib/bunny-storage";

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const vaultItemId = String(formData.get("vaultItemId") ?? "").trim();

  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (!vaultItemId) {
    return NextResponse.json({ error: "vaultItemId is required" }, { status: 400 });
  }

  const storageKey = buildStorageKey(vaultItemId, file.name);

  try {
    const buffer = await file.arrayBuffer();
    await uploadToBunnyStorage(buffer, storageKey, file.type);
    return NextResponse.json({ storageKey, size: buffer.byteLength });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
