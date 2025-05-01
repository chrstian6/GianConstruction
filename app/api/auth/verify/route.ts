// app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import User from "@/models/user";
import connectDB from "@/lib/db";

export async function GET() {
  await connectDB();

  try {
    // Correct way to access cookies - no await needed
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ verified: false }, { status: 200 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return NextResponse.json({ verified: false }, { status: 200 });
    }

    return NextResponse.json({
      verified: true,
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
      token: token, // Include the token in the response
    });
  } catch (error) {
    return NextResponse.json({ verified: false }, { status: 200 });
  }
}
