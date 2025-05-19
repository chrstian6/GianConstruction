import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import Log from "@/models/Log";
import User from "@/models/user";
import { getAuthUser, UserPayload } from "@/lib/jwt";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const {
      firstName,
      lastName,
      email,
      password,
      contact,
      address,
      gender,
      position,
      role = "admin",
    } = await request.json();

    // Validate required fields
    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !contact ||
      !position
    ) {
      return NextResponse.json(
        {
          error:
            "All required fields (email, password, firstName, lastName, contact, position) must be provided",
        },
        { status: 400 }
      );
    }

    // Check for existing employee
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get admin name from JWT using getAuthUser
    let adminName: string = "System";
    const authUser: UserPayload | null = await getAuthUser();
    if (authUser && authUser.firstName && authUser.lastName) {
      adminName = `${authUser.firstName} ${authUser.lastName}`;
    } else if (authUser && authUser.email) {
      adminName = authUser.email;
      console.warn(
        "Admin firstName or lastName missing, using email:",
        authUser.email
      );
    } else {
      console.warn("No authenticated user found, defaulting to System");
    }

    // Create employee
    const employee = new Employee({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contact,
      address,
      gender,
      position,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await employee.save();

    // Create log
    const targetName = `${firstName} ${lastName}`;
    const log = new Log({
      action: `Employee ${targetName} created as ${role} by ${adminName}`,
      adminName,
      targetEmail: email,
      targetName,
      createdAt: new Date(),
    });
    await log.save();

    return NextResponse.json(
      { message: "Employee created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "employee";
    const status = searchParams.get("status") || "all";

    if (type !== "employee") {
      return NextResponse.json({ employees: [], totalPages: 1 });
    }

    const query: any = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    const employees = await Employee.find(query)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit);
    const totalEmployees = await Employee.countDocuments(query);
    const totalPages = Math.ceil(totalEmployees / limit);

    return NextResponse.json({ employees, totalPages });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}
