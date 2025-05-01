// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

const protectedRoutes = ["/admin", "/dashboard"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Skip middleware for non-protected routes
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check token in cookies first
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url)); // Redirect to app/(user)/page.tsx
  }

  // Verify token without database call
  const decoded = await verifyToken(token);
  if (!decoded) {
    return NextResponse.redirect(new URL("/", request.url)); // Redirect to app/(user)/page.tsx
  }

  // Role-based access control
  if (pathname.startsWith("/admin") && decoded.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
