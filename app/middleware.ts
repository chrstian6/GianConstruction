import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

interface TokenPayload {
  role: string;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const token: string | undefined = request.cookies.get("token")?.value;
  const { pathname }: { pathname: string } = request.nextUrl;

  console.log(
    "Middleware: Path:",
    pathname,
    "Token:",
    token ? "present" : "absent"
  );

  if (token) {
    try {
      const payload: TokenPayload | null = await verifyToken(token);
      if (!payload) {
        console.log("Middleware: Invalid token, redirecting to /");
        const redirectUrl = new URL("/", request.url);
        redirectUrl.searchParams.set("nocache", Date.now().toString());
        return NextResponse.redirect(redirectUrl);
      }

      // Prevent authenticated users from accessing home page
      if (pathname === "/") {
        if (payload.role === "user") {
          console.log(
            "Middleware: Authenticated user on /, redirecting to /dashboard"
          );
          return NextResponse.redirect(new URL("/dashboard", request.url));
        } else if (payload.role === "admin") {
          console.log("Middleware: Admin on /, redirecting to /admin");
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }

      // Protect /admin/* from non-admins
      if (pathname.startsWith("/admin") && payload.role !== "admin") {
        console.log("Middleware: Non-admin accessing /admin, redirecting to /");
        const redirectUrl = new URL("/", request.url);
        redirectUrl.searchParams.set("nocache", Date.now().toString());
        return NextResponse.redirect(redirectUrl);
      }

      // Prevent admins from accessing user routes
      if (
        payload.role === "admin" &&
        (pathname.startsWith("/dashboard") ||
          pathname.startsWith("/profile") ||
          pathname.startsWith("/cart"))
      ) {
        console.log(
          "Middleware: Admin accessing user route, redirecting to /admin"
        );
        const redirectUrl = new URL("/admin", request.url);
        redirectUrl.searchParams.set("nocache", Date.now().toString());
        return NextResponse.redirect(redirectUrl);
      }

      console.log("Middleware: Access granted, role:", payload.role);
    } catch (error: unknown) {
      console.error("Middleware: Token verification error:", error);
      console.log("Middleware: Invalid token, redirecting to /");
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("nocache", Date.now().toString());
      return NextResponse.redirect(redirectUrl);
    }
  } else {
    // Protect /admin/*, /dashboard, /profile, /cart for unauthenticated users
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/cart")
    ) {
      console.log("Middleware: No token for protected route, redirecting to /");
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("nocache", Date.now().toString());
      return NextResponse.redirect(redirectUrl);
    }
    // Allow public access to /, /designs, /supplies, /about, /services
    console.log("Middleware: Public route, allowing access");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/cart/:path*",
  ],
};
