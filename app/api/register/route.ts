import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import Log from "@/models/Log";
import bcrypt from "bcryptjs";
import { generateUniqueUserId } from "@/lib/generateUserId";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const {
      firstName,
      lastName,
      email,
      password,
      address,
      contact,
      gender,
      createdByAdmin = false,
      adminName = "System",
    } = await request.json();

    if (!email || !password || !firstName || !lastName || !contact) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && !existingUser.tempRegistration) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await generateUniqueUserId();

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
            user_id: userId,
            otp: undefined,
            otpExpiry: undefined,
            tempRegistration: false,
            isActive: true,
            createdByAdmin,
            updatedAt: new Date(),
          },
        }
      );

      if (createdByAdmin) {
        const log = new Log({
          action: `User ${email} created by ${adminName}`,
          adminName,
          targetEmail: email,
          targetName: `${firstName} ${lastName}`,
          createdAt: new Date(),
        });
        await log.save();
      }

      return NextResponse.json(
        { message: "Account activated successfully" },
        { status: 200 }
      );
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      address,
      contact,
      gender,
      role: "user",
      user_id: userId,
      tempRegistration: false,
      isActive: true,
      createdByAdmin,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newUser.save();

    if (createdByAdmin) {
      const log = new Log({
        action: `User ${email} created by ${adminName}`,
        adminName,
        targetEmail: email,
        targetName: `${firstName} ${lastName}`,
        createdAt: new Date(),
      });
      await log.save();
    }

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
