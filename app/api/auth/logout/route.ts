import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    console.log("logout/route: Handling POST request");
    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    console.log("logout/route: Token cookie cleared");
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("logout/route: Error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
