// app/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const protectedRoutes = ["/dashboard", "/profile"];
  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtected) {
    const cookie = request.cookies.get("authToken");
    if (!cookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verify token with your auth API
    const response = await fetch(`${request.nextUrl.origin}/api/auth/check`, {
      headers: {
        Cookie: `authToken=${cookie.value}`,
      },
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}
