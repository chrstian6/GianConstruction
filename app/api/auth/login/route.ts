// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const loginAttempts = new Map<
  string,
  {
    count: number;
    lastAttempt: Date;
    lockedUntil: Date | null;
  }
>();

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const attemptKey = `${email}:${ipAddress}`;
    const attempt = loginAttempts.get(attemptKey);

    if (attempt?.lockedUntil && new Date() < attempt.lockedUntil) {
      return NextResponse.json(
        {
          error: "Account locked. Try again later.",
          lockout: true,
          remainingMinutes: Math.ceil(
            (attempt.lockedUntil.getTime() - Date.now()) / 60000
          ),
        },
        { status: 429 }
      );
    }

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      incrementFailedAttempt(attemptKey);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const currentAttempt = incrementFailedAttempt(attemptKey);

      if (currentAttempt.count >= MAX_LOGIN_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
        loginAttempts.set(attemptKey, { ...currentAttempt, lockedUntil });

        return NextResponse.json(
          {
            error: "Account locked due to too many attempts",
            lockout: true,
            remainingMinutes: Math.ceil(LOCKOUT_DURATION / 60000),
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: "Invalid credentials",
          attemptsLeft: MAX_LOGIN_ATTEMPTS - currentAttempt.count,
        },
        { status: 401 }
      );
    }

    // Successful login
    loginAttempts.delete(attemptKey);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400, // 1 day
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contact: user.contact || "",
        gender: user.gender || "",
        address: user.address || "",
        isActive: user.isActive || true,
        tempRegistration: user.tempRegistration || false,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function incrementFailedAttempt(key: string) {
  const now = new Date();
  const currentAttempt = loginAttempts.get(key) || {
    count: 0,
    lastAttempt: now,
    lockedUntil: null,
  };

  if (now.getTime() - currentAttempt.lastAttempt.getTime() > LOCKOUT_DURATION) {
    currentAttempt.count = 0;
  }

  currentAttempt.count += 1;
  currentAttempt.lastAttempt = now;
  loginAttempts.set(key, currentAttempt);
  return currentAttempt;
}
