import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/dashboard", "/profile", "/projects"];
const authRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isAuthRoute = authRoutes.includes(path);

  const token = request.cookies.get("token")?.value;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  try {
    if (token) {
      await jwtVerify(token, secret);

      // Redirect authenticated users away from auth routes
      if (isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } else if (isProtectedRoute) {
      // Redirect unauthenticated users to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (error) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}
