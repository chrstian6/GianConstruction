// app/api/verify-otp/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, otp } = await request.json();

    // Validate required fields
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await User.findOne({ email }).select(
      "+otp +otpExpiry +password"
    );
    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 400 }
      );
    }

    console.log("User Document During OTP Verification:", user.toObject());

    // Check if user is already verified
    if (!user.tempRegistration && user.isActive) {
      return NextResponse.json(
        { status: "already_verified", message: "Account already verified" },
        { status: 200 } // Changed to 200 with status indicator
      );
    }

    // Check if OTP exists
    if (!user.otp) {
      return NextResponse.json(
        { error: "No OTP found for this user" },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Verify the OTP
    if (otp !== user.otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Hash the password if it's not already hashed
    if (user.password && !user.password.startsWith("$2")) {
      user.password = await bcrypt.hash(user.password, 10);
    }

    // Complete the registration
    user.tempRegistration = false;
    user.isActive = true;
    user.otp = undefined; // Clear OTP
    user.otpExpiry = undefined; // Clear OTP expiry
    user.updatedAt = new Date();

    await user.save();

    return NextResponse.json({
      status: "verified",
      message: "Account verified successfully. Please login to continue.",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
