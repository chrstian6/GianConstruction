import { NextResponse } from "next/server";
import Material from "@/models/Material";
import connectDB from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const material = await Material.findById(params.id).populate("category");
    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(material);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch material" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const data = await request.json();
    const material = await Material.findByIdAndUpdate(params.id, data, {
      new: true,
    }).populate("category");
    return NextResponse.json(material);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update material" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await Material.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Material deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}
