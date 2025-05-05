import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/user";
import connectDB from "@/lib/db";
import { cookies } from "next/headers";
import { generateToken, UserPayload } from "@/lib/jwt";

const loginAttempts = new Map<
  string,
  { attempts: number; lastAttempt: number }
>();

export async function POST(req: Request) {
  await connectDB();

  try {
    const { email, password } = await req.json();

    // Rate limiting check
    const userAttempts = loginAttempts.get(email);
    if (userAttempts && userAttempts.attempts >= 3) {
      const timeSinceLastAttempt = Date.now() - userAttempts.lastAttempt;
      const cooldownTime = 60 * 1000;

      if (timeSinceLastAttempt < cooldownTime) {
        const remainingTime = Math.ceil(
          (cooldownTime - timeSinceLastAttempt) / 1000
        );
        return NextResponse.json(
          {
            error: `Too many attempts. Please try again in ${remainingTime} seconds.`,
          },
          { status: 429 }
        );
      }
    }

    // User lookup
    const user = await User.findOne({ email });
    if (!user) {
      loginAttempts.set(email, {
        attempts: (loginAttempts.get(email)?.attempts || 0) + 1,
        lastAttempt: Date.now(),
      });
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Password verification
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      loginAttempts.set(email, {
        attempts: (loginAttempts.get(email)?.attempts || 0) + 1,
        lastAttempt: Date.now(),
      });
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Account status check
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is inactive. Please contact support." },
        { status: 403 }
      );
    }

    // Token generation
    const tokenPayload: UserPayload = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      contact: user.contact || "",
      gender: user.gender || "",
      address: user.address || "",
      role: user.role || "user",
      isActive: user.isActive,
    };

    const token = await generateToken(tokenPayload);

    // Response with user data and token
    const response = NextResponse.json({
      user: {
        ...tokenPayload,
        token,
      },
      isAdmin: user.role === "admin",
      redirectTo: user.role === "admin" ? "/admin" : null,
    });

    // Set HTTP-only cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 86400,
    });

    loginAttempts.delete(email);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
