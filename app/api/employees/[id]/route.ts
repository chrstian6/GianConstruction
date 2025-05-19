import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import Log from "@/models/Log";
import { jwtVerify } from "jose";
import User from "@/models/user";

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
      position,
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

    // Check if employee exists
    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Prepare update object
    const update: any = {};
    if (firstName) update.firstName = firstName;
    if (lastName) update.lastName = lastName;
    if (email) {
      const existingEmployee = await Employee.findOne({
        email,
        _id: { $ne: id },
      });
      if (existingEmployee) {
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
    if (position) update.position = position;
    if (isActive !== undefined) update.isActive = isActive;
    update.updatedAt = new Date();

    // Update employee
    await Employee.findByIdAndUpdate(id, { $set: update });

    // Log the action
    const targetName = `${employee.firstName} ${employee.lastName}`;
    const logAction =
      action ||
      `Employee ${targetName} ${
        isActive !== undefined
          ? isActive
            ? "activated"
            : "deactivated"
          : "updated"
      } by ${adminName}`;
    await Log.create({
      action: logAction,
      adminName,
      targetEmail: targetEmail || employee.email,
      targetName,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Employee updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Employee update error:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}
