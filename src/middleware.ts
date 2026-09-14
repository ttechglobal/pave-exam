import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /dashboard and its sub-routes
  if (pathname.startsWith("/dashboard")) {
    const cookie = req.cookies.get("admin_session");
    if (!cookie || cookie.value !== "1") {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};