// middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. First check your JWT token (primary auth system)
  const token = request.cookies.get("token")?.value;
  let decodedToken = null;

  try {
    decodedToken = token ? await verifyToken(token) : null; // Make sure verifyToken is called correctly
    } catch (error) {
    console.error("Token verification failed:", error);
  }

  // 2. Only initialize Supabase if you're using it for storage
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // 3. Get Supabase session only if needed
  let supabaseSession = null;
  if (decodedToken?.id) {
    // If using JWT for Supabase auth
    await supabase.auth.setSession({
      access_token: token!,
      refresh_token: "",
    });
    supabaseSession = (await supabase.auth.getSession()).data.session;
  }

  // 4. Define routes
  const publicRoutes = ["/", "/supplies", "/designs", "/projects"];
  const adminRoutes = ["/admin", "/admin/:path*"];
  const userProtectedRoutes = ["/dashboard", "/dashboard/:path*"];

  // 5. Auth checks
  const isAuthenticated = !!decodedToken || !!supabaseSession;
  const isAdmin =
    decodedToken?.role === "admin" ||
    supabaseSession?.user?.user_metadata?.role === "admin";

  // 6. Route protection logic
  const { pathname } = request.nextUrl;

  // Redirect authenticated users
  if (isAuthenticated) {
    if (isAdmin && publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (
      adminRoutes.some((route) =>
        pathname.startsWith(route.replace(":path*", ""))
      ) &&
      !isAdmin
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (
      userProtectedRoutes.some((route) =>
        pathname.startsWith(route.replace(":path*", ""))
      ) &&
      isAdmin
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return response;
  }

  // Redirect unauthenticated users
  if (
    adminRoutes.some((route) =>
      pathname.startsWith(route.replace(":path*", ""))
    ) ||
    userProtectedRoutes.some((route) =>
      pathname.startsWith(route.replace(":path*", ""))
    )
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/admin/:path*",
    "/supplies",
    "/designs",
    "/projects",
  ],
};
