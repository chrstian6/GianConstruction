import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import Log from "@/models/Log";
import bcrypt from "bcryptjs";
import { generateUniqueUserId } from "@/lib/generateUserId";
import jwt from "jsonwebtoken";

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

    // Check if request is from admin (has Authorization header)
    let adminName = "System";
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your_jwt_secret"
        ) as any;
        adminName = `${decoded.firstName} ${decoded.lastName}` || "Admin";
      } catch (jwtError) {
        console.error("JWT verification error:", jwtError);
      }
    }

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

    // Create log entry if admin-initiated
    if (authHeader) {
      const log = new Log({
        action: `User ${email} created by ${adminName}`,
        adminName,
        targetEmail: email,
        targetName: `${user.firstName} ${user.lastName}`,
        createdAt: new Date(),
      });
      await log.save();
      console.log("Log created:", {
        action: log.action,
        adminName,
        targetEmail: email,
      });
    }

    return NextResponse.json({ message: "Account activated successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
