// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Clear all authentication related cookies
    ["authToken", "session", "refreshToken"].forEach((cookieName) => {
      cookieStore.set({
        name: cookieName,
        value: "",
        path: "/",
        expires: new Date(0),
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
      });
    });

    return NextResponse.json(
      { message: "Logged out successfully" },
      {
        status: 200,
        headers: {
          // Prevent caching of the logout response
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}