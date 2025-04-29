import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/user";
import connectDB from "@/lib/db";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const loginAttempts = new Map<
  string,
  { attempts: number; lastAttempt: number }
>();

export async function POST(req: Request) {
  await connectDB();

  try {
    const { email, password } = await req.json();
    console.log("Login attempt for email:", email);

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
        { error: "Account not activated. Please check your email." },
        { status: 403 }
      );
    }

    // Token generation with proper encoding
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const tokenPayload = {
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

    const token = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret);

    // Secure cookie settings
    const response = NextResponse.json({
      user: tokenPayload,
      isAdmin: user.role === "admin",
      redirectTo: user.role === "admin" ? "/admin" : null,
    });

    // Set cookie with proper encoding
    response.cookies.set({
      name: "aap-jwt",
      value: encodeURIComponent(token), // Properly encode the token
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
