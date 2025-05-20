import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { generateUniqueUserId } from "@/lib/generateUserId";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      tempRegistration: true,
    });

    if (!user) {
      return NextResponse.json(
        { error: "No pending registration found for this email" },
        { status: 400 }
      );
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const userId = await generateUniqueUserId();

    // Activate user
    user.password = hashedPassword;
    user.user_id = userId;
    user.otp = null;
    user.otpExpiry = null;
    user.tempRegistration = false;
    user.isActive = true;
    user.updatedAt = new Date();

    await user.save();

    console.log("User activated:", {
      email: user.email,
      isActive: user.isActive,
      tempRegistration: user.tempRegistration,
    });

    return NextResponse.json({ message: "Account activated successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
