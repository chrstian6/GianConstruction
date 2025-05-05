import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-development"
);

export interface UserPayload extends JWTPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  contact?: string;
  gender?: string;
  address?: string;
  role: string;
  isActive: boolean;
}

export async function generateToken(payload: UserPayload): Promise<string> {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret);
    console.log("JWT generated successfully:", token);
    return token;
  } catch (error) {
    console.error("Error generating JWT:", error);
    throw new Error("Failed to generate token");
  }
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  if (!token) {
    console.warn("No token provided for verification");
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      clockTolerance: 15,
    });
    console.log("JWT verified successfully:", payload);
    if (!payload.id || !payload.email || !payload.role) {
      console.warn("Invalid JWT payload:", payload);
      return null;
    }
    return payload as UserPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function getAuthUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value; // Changed from "app-jwt" to "token"
  if (!token) {
    console.warn("No token cookie found");
    return null;
  }
  return await verifyToken(token);
}
