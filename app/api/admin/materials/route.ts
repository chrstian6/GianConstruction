import { NextResponse } from "next/server";
import Material from "@/models/Material";
import connectDB from "@/lib/db";

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const material = await Material.create(data);
    return NextResponse.json(material);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create material" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const materials = await Material.find().populate("category");
    return NextResponse.json(materials);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}
