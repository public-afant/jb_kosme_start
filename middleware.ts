import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkAuth } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // console.log("Read Middleware! ");
  const publicPaths = [
    "/login",
    "/signup",
    "/favicon.ico",
    "/apple-icon.png",
    "/icon/",
    "/manifest.webmanifest",
    "/.well-known/assetlinks.json",
  ];
  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const user = await checkAuth(request);

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-icon.png|icon/).*)",
  ],
};
