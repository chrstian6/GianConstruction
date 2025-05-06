import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/user";
import connectDB from "@/lib/db";

export async function GET() {
  await connectDB();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log(
      "verify/route: Processing verification, token:",
      token ? "present" : "absent"
    );

    if (!token) {
      console.warn("verify/route: No token cookie found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      console.warn("verify/route: Invalid token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("verify/route: Token verified, payload:", payload);

    const user = await User.findOne({ _id: payload.id, isActive: true }).select(
      "-password"
    );
    if (!user) {
      console.warn(
        "verify/route: User not found or inactive for ID:",
        payload.id
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("verify/route: User verified:", user.email);
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contact: user.contact,
        gender: user.gender,
        address: user.address,
        isActive: user.isActive,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("verify/route: Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
