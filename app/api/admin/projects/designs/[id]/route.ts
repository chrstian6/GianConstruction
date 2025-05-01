// app/api/admin/projects/designs/[id]/route.ts
import { NextResponse } from "next/server";
import Design from "@/models/Design";
import connectDB from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const design = await Design.findById(params.id);
    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }
    return NextResponse.json(design);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch design" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const body = await req.json();
    const design = await Design.findByIdAndUpdate(params.id, body, {
      new: true,
    });
    return NextResponse.json(design);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update design" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    await Design.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete design" },
      { status: 500 }
    );
  }
}
