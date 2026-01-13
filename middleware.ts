import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl;

  // Kun for highlights.nowla.org
  if (host === "highlights.nowla.org") {
    const pathname = url.pathname;

    // Ikke rør Next.js interne assets eller API
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname === "/favicon.ico" ||
      pathname.startsWith("/images") ||
      pathname.startsWith("/fonts") ||
      pathname.startsWith("/lab/now2025")
    ) {
      return NextResponse.next();
    }

    const rewritten = url.clone();

    // Root "/" -> "/lab/now2025"
    if (pathname === "/" || pathname === "/now2025") {
      rewritten.pathname = "/lab/now2025";
      return NextResponse.rewrite(rewritten);
    }

    // /now2025/* -> /lab/now2025/*
    if (pathname.startsWith("/now2025/")) {
      rewritten.pathname = `/lab${pathname}`;
      return NextResponse.rewrite(rewritten);
    }

    // Fallback for any other paths (backward compatibility)
    rewritten.pathname = `/lab/now2025${pathname}`;
    return NextResponse.rewrite(rewritten);
  }

  return NextResponse.next();
}

// Sørg for at middleware kjører på "vanlige" paths
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
