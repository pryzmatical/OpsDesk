import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// Coarse, optimistic gate only — reads the cookie and checks the JWT is
// well-formed and unexpired. It does NOT hit the database, and it is not the
// real authorization boundary: every mutating API route re-verifies the
// session and role independently (see src/lib/rbac.ts). Next.js's own docs
// recommend exactly this split — keep Proxy minimal, do real checks in a
// Data Access Layer close to the data.
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
