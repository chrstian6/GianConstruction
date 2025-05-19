import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import Log from "@/models/Log";
import { jwtVerify } from "jose";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const {
      firstName,
      lastName,
      email,
      contact,
      gender,
      address,
      isActive,
      targetEmail,
      action,
    } = body;

    if (isActive !== undefined && typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    // Verify admin
    let adminName = "System";
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.id) {
          const admin = await User.findById(payload.id).select(
            "firstName lastName"
          );
          if (admin) {
            adminName = `${admin.firstName} ${admin.lastName}`;
          } else {
            console.warn(`Admin not found for ID: ${payload.id}`);
          }
        } else {
          console.warn("JWT payload missing id");
        }
      } catch (err) {
        console.error("JWT verification error:", err);
      }
    } else {
      console.warn("No Authorization token provided");
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update object
    const update: any = {};
    if (firstName) update.firstName = firstName;
    if (lastName) update.lastName = lastName;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }
      update.email = email;
    }
    if (contact) update.contact = contact;
    if (gender !== undefined) update.gender = gender;
    if (address !== undefined) update.address = address;
    if (isActive !== undefined) update.isActive = isActive;
    update.updatedAt = new Date();

    // Update user
    await User.findByIdAndUpdate(id, { $set: update });

    // Log the action
    const targetName = `${user.firstName} ${user.lastName}`;
    const logAction =
      action ||
      `User ${targetName} ${
        isActive !== undefined
          ? isActive
            ? "activated"
            : "deactivated"
          : "updated"
      } by ${adminName}`;
    await Log.create({
      action: logAction,
      adminName,
      targetEmail: targetEmail || user.email,
      targetName,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "User updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
