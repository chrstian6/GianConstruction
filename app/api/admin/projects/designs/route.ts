import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Design from "@/models/Design";
import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
});
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Debug log to see what's being received
    console.log("Received request body:", body);

    // Convert single image to array if needed
    const images = Array.isArray(body.images)
      ? body.images
      : body.image
      ? [body.image]
      : [];

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "category",
      "style",
      "sqm",
      "rooms",
      "estimatedCost",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", missingFields },
        { status: 400 }
      );
    }

    // Validate at least one image exists
    if (images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    const newDesign = new Design({
      title: body.title,
      description: body.description,
      images: images,
      category: body.category,
      style: body.style,
      sqm: Number(body.sqm),
      rooms: Number(body.rooms),
      estimatedCost: Number(body.estimatedCost),
      isFeatured: Boolean(body.isFeatured || false),
    });

    const savedDesign = await newDesign.save();

    return NextResponse.json({
      success: true,
      data: savedDesign.toObject(), // Convert Mongoose document to plain object
    });
  } catch (error) {
    console.error("Error in design creation:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic"; // Ensure dynamic fetching

export async function GET() {
  try {
    await dbConnect();
    const designs = await Design.find().sort({ createdAt: -1 });

    // Set cache headers
    const response = NextResponse.json({ success: true, data: designs });
    response.headers.set("Cache-Control", "no-store, max-age=0");

    return response;
  } catch (error) {
    console.error("Error fetching designs:", error);
    return NextResponse.json(
      { error: "Failed to fetch designs" },
      { status: 500 }
    );
  }
}
