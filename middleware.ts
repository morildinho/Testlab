import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl;

  // Only for highlights.nowla.org
  if (host === "highlights.nowla.org") {
    const pathname = url.pathname;

    // Don't touch Next.js internal assets or API
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname === "/favicon.ico" ||
      pathname.startsWith("/images") ||
      pathname.startsWith("/fonts") ||
      pathname.startsWith("/lab/now")
    ) {
      return NextResponse.next();
    }

    const rewritten = url.clone();

    // Root "/" -> "/lab/now"
    if (pathname === "/") {
      rewritten.pathname = "/lab/now";
      return NextResponse.rewrite(rewritten);
    }

    // Year paths: /2025, /2024 -> /lab/now/2025, /lab/now/2024
    const yearMatch = pathname.match(/^\/(\d{4})(\/.*)?$/);
    if (yearMatch) {
      rewritten.pathname = `/lab/now${pathname}`;
      return NextResponse.rewrite(rewritten);
    }

    // Fallback: prepend /lab/now to any other paths
    rewritten.pathname = `/lab/now${pathname}`;
    return NextResponse.rewrite(rewritten);
  }

  return NextResponse.next();
}

// Ensure middleware runs on regular paths
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
