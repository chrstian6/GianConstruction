import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { available: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (existingUser) {
      return NextResponse.json(
        { available: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    return NextResponse.json({ available: true }, { status: 200 });
  } catch (error) {
    console.error("Error checking email:", error);
    return NextResponse.json(
      { available: false, error: "Failed to check email" },
      { status: 500 }
    );
  }
}
