// app/api/send-registration-otp/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import { sendEmail } from "@/lib/nodemailer";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { firstName, lastName, email, password, contact, gender, address } =
      await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !contact) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if email already exists (permanent account)
    const existingUser = await User.findOne({ email });
    if (existingUser && !existingUser.tempRegistration) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (10 minutes from now)
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    // Store the pending registration with OTP and all user details
    await User.findOneAndUpdate(
      { email },
      {
        firstName,
        lastName,
        email,
        password, // Store the plain password temporarily
        contact,
        gender,
        address,
        otp,
        otpExpiry,
        tempRegistration: true, // Mark as temporary registration
        isActive: false, // User is inactive until OTP verification
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { upsert: true, new: true } // Creates a new document if it doesn't exist
    );

    // Email content
    const subject = "Verify Your Email Address";
    const text = `
Your verification code is: ${otp}

This code will expire in 10 minutes.

If you did not request this code, please ignore this email.
`;

    // Send the email
    await sendEmail(email, subject, text);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending registration OTP:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
