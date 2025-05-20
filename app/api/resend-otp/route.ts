import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import { sendEmail } from "@/lib/nodemailer";

export async function POST(request: Request) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const { email } = await request.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find the user by email (case-insensitive)
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (!user) {
      return NextResponse.json(
        { error: "No pending registration found for this email" },
        { status: 400 }
      );
    }

    // Check if the user already has an active account
    if (user.isActive && !user.tempRegistration) {
      return NextResponse.json(
        { error: "Account already verified" },
        { status: 400 }
      );
    }

    // Generate a new 6-digit OTP (same as /api/send-registration-otp)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (10 minutes from now)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update the user document with the new OTP
    const updatedUser = await User.findOneAndUpdate(
      { email: { $regex: new RegExp(`^${email}$`, "i") } },
      {
        $set: {
          otp,
          otpExpiry,
          updatedAt: new Date(),
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update OTP for this email" },
        { status: 500 }
      );
    }

    console.log("Updated user with new OTP:", {
      email: updatedUser.email,
      otp,
      otpExpiry,
    });

    // Email content (aligned with /api/send-registration-otp)
    const subject = "Verify Your Email Address";
    const text = `
Your new verification code is: ${otp}

This code will expire in 10 minutes.

If you did not request this code, please ignore this email.
`;

    // Send the email
    try {
      await sendEmail(email, subject, text);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return NextResponse.json(
        { error: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    return NextResponse.json(
      { error: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}
