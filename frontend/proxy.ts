import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ACCESS_TOKEN_KEY } from "@/lib/api/session";

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
const PUBLIC_FILE_PATTERN = /\.[a-zA-Z0-9]+$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(ACCESS_TOKEN_KEY)?.value);
  const isAuthPage = PUBLIC_PATHS.filter((path) => path !== "/").some((path) => pathname.startsWith(path));
  const isPublic = pathname === "/" || isAuthPage;
  const isPublicFile = PUBLIC_FILE_PATTERN.test(pathname);

  if (!hasSession && !isPublic && !isPublicFile && !pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL("/workspace", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
