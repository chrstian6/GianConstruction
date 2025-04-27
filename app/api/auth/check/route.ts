// app/api/auth/check/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import User from "@/models/user";

export async function GET() {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as { userId: string };

      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return NextResponse.json({ authenticated: false }, { status: 200 });
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          contact: user.contact || "",
          gender: user.gender || "",
          address: user.address || "",
          isActive: user.isActive,
          tempRegistration: user.tempRegistration,
        },
      });
    } catch (error) {
      // Clear invalid token
      cookieStore.set({
        name: "authToken",
        value: "",
        path: "/",
        expires: new Date(0),
      });

      return NextResponse.json({ authenticated: false }, { status: 200 });
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
