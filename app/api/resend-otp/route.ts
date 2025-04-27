// app/api/resend-otp/route.ts
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

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email" },
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

    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (10 minutes from now)
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    // Update the user document with the new OTP
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          otp: otp,
          otpExpiry: otpExpiry,
          updatedAt: new Date(),
        },
      },
      { new: true } // Return the updated document
    );

    console.log("Updated user with new OTP:", updatedUser);

    // Email content
    const subject = "Verify Your Email Address";
    const text = `
Your new verification code is: ${otp}
This code will expire in 10 minutes.
If you did not request this code, please ignore this email.
`;

    // Send the email
    await sendEmail(email, subject, text);

    return NextResponse.json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    return NextResponse.json(
      { error: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}
