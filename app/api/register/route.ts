// app/api/register/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const { firstName, lastName, email, password, address, contact, gender } =
      await request.json();

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !contact) {
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If the user has a temporary registration, update it to a permanent one
    if (existingUser && existingUser.tempRegistration) {
      await User.findOneAndUpdate(
        { email },
        {
          $set: {
            firstName,
            lastName,
            password: hashedPassword,
            address,
            contact,
            gender,
            otp: undefined, // Clear OTP
            otpExpiry: undefined, // Clear OTP expiry
            tempRegistration: false, // Convert to permanent registration
            isActive: true, // Mark the user as active
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json(
        { message: "Account activated successfully" },
        { status: 200 }
      );
    }

    // Create a new user entry if no temporary registration exists
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      address,
      contact,
      gender,
      tempRegistration: false, // Direct registration (no OTP flow)
      isActive: true, // Mark the user as active
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newUser.save();

    return NextResponse.json(
      { message: "Registration successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
