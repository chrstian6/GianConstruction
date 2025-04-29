// lib/jwt.ts
import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import { cookies, headers } from "next/headers";
import { type NextRequest } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

interface UserPayload extends JWTPayload {
  id: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      clockTolerance: 15, // 15 seconds leeway
    });

    if (!payload.id || !payload.role) {
      console.error("Token missing required fields");
      return null;
    }

    return payload as UserPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("app-jwt")?.value;
  if (!token) return null;
  return await verifyToken(token);
}
