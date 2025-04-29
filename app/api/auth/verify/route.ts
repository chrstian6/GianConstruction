  import { NextResponse } from "next/server";
  import { cookies } from "next/headers";
  import { jwtVerify } from "jose";
  import User from "@/models/user";
  import connectDB from "@/lib/db";

  export async function GET() {
    await connectDB();

    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;

      if (!token) {
        return NextResponse.json(
          { error: "Not authenticated" }, 
          { status: 401 }
        );
      }

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      
      const user = await User.findById(payload.id).select("-password");
      if (!user) {
        return NextResponse.json(
          { error: "User not found" }, 
          { status: 404 }
        );
      }

      return NextResponse.json({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          contact: user.contact,
          gender: user.gender,
          address: user.address,
          isActive: user.isActive,
          role: user.role // Make sure to include role if needed
        }
      });

    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" }, 
        { status: 401 }
      );
    }
  }