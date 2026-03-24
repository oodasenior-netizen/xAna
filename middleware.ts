import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

function secureRedirect(req: NextRequest, path: string) {
  const url = req.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return secureRedirect(req, "/entry");
  }

  const session = await verifySessionToken(token);

  if (!session) {
    return secureRedirect(req, "/entry");
  }

  if (path.startsWith("/creator") && session.role !== "creator") {
    return secureRedirect(req, "/entry");
  }

  if (path.startsWith("/app") && session.role !== "subscriber" && session.role !== "creator") {
    return secureRedirect(req, "/entry");
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "same-origin");
  return response;
}

export const config = {
  matcher: ["/app/:path*", "/creator/:path*"],
};
