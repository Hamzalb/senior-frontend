import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token    = searchParams.get("token");
  const username = searchParams.get("username");
  const role     = searchParams.get("role");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=google_failed", origin));
  }

  // Redirect to home and set all cookies in the HTTP response headers
  const response = NextResponse.redirect(new URL("/", origin));
  const maxAge   = 60 * 60 * 24 * 7; // 7 days

  response.cookies.set("token",    token,              { path: "/", maxAge });
  response.cookies.set("username", username || "",     { path: "/", maxAge });
  response.cookies.set("role",     role || "customer", { path: "/", maxAge });

  return response;
}
