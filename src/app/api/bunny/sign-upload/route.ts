import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { createBunnyVideo, signTusUpload } from "@/lib/bunny";

/**
 * POST /api/bunny/sign-upload
 *
 * Creator-only. Creates a video entry on Bunny Stream and returns signed TUS
 * credentials so the browser can upload directly to Bunny without routing the
 * file through this server.
 *
 * Request body: { title: string }
 * Response:     { videoId, signature, expiry, libraryId }
 */
export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let title: string;
  try {
    const body = await req.json();
    title = String(body.title ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const videoId = await createBunnyVideo(title);
    const credentials = signTusUpload(videoId);
    return NextResponse.json(credentials);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bunny API error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
