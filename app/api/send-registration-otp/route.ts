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

    // Check for any existing user (temporary or active)
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Email already registered. Please log in or use a different email.",
        },
        { status: 400 }
      );
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (10 minutes from now)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Store the pending registration
    const newUser = new User({
      firstName,
      lastName,
      email,
      password, // Store plain password temporarily
      contact,
      gender,
      address,
      otp,
      otpExpiry,
      tempRegistration: true,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newUser.save();

    console.log("Stored pending registration:", {
      email: newUser.email,
      otp,
      otpExpiry,
      isActive: newUser.isActive,
      tempRegistration: newUser.tempRegistration,
    });

    // Email content
    const subject = "Verify Your Email Address";
    const text = `
Your verification code is: ${otp}

This code will expire in 10 minutes.

If you did not request this code, please ignore this email.
`;

    // Send the email
    try {
      await sendEmail(email, subject, text);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Delete the user if email fails
      await User.deleteOne({ email });
      return NextResponse.json(
        { error: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending registration OTP:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
