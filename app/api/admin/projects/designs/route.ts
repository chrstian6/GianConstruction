import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Design from "@/models/Design";
import Quotation from "@/models/Quotation";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Debug log to see what's being received
    console.log("Received request body:", JSON.stringify(body, null, 2));

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

    // Validate materials if provided
    if (body.materials && Array.isArray(body.materials)) {
      for (const [index, material] of body.materials.entries()) {
        if (!material.name || typeof material.name !== "string") {
          return NextResponse.json(
            {
              error: `Invalid material data: 'name' is missing or invalid for material at index ${index}`,
            },
            { status: 400 }
          );
        }
        if (typeof material.quantity !== "number" || material.quantity < 1) {
          return NextResponse.json(
            {
              error: `Invalid material data: 'quantity' must be a number ≥ 1 for material at index ${index}`,
            },
            { status: 400 }
          );
        }
        if (typeof material.unitPrice !== "number" || material.unitPrice < 0) {
          return NextResponse.json(
            {
              error: `Invalid material data: 'unitPrice' must be a number ≥ 0 for material at index ${index}`,
            },
            { status: 400 }
          );
        }
        // 'unit' is optional to avoid breaking existing forms
        if (material.unit && typeof material.unit !== "string") {
          return NextResponse.json(
            {
              error: `Invalid material data: 'unit' must be a string for material at index ${index}`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Start a session for atomic operations
    const session = await mongoose.startSession();
    let isTransactionCommitted = false;

    try {
      session.startTransaction();

      // Create the design
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
        projectId:
          body.projectId && mongoose.Types.ObjectId.isValid(body.projectId)
            ? new mongoose.Types.ObjectId(body.projectId)
            : undefined,
      });

      const savedDesign = await newDesign.save({ session });

      // Create the quotation if materials are provided
      if (
        body.materials &&
        Array.isArray(body.materials) &&
        body.materials.length > 0
      ) {
        const totalCost = body.materials.reduce(
          (sum: number, material: { quantity: number; unitPrice: number }) =>
            sum + material.quantity * material.unitPrice,
          0
        );

        const quotation = new Quotation({
          designId: savedDesign._id,
          materials: body.materials.map((material: any) => ({
            name: material.name,
            quantity: material.quantity,
            unit: material.unit || "unit", // Default to "unit" if not provided
            unitPrice: material.unitPrice,
          })),
          totalCost,
        });

        await quotation.save({ session });
      }

      await session.commitTransaction();
      isTransactionCommitted = true;

      return NextResponse.json({
        success: true,
        data: savedDesign.toObject(),
      });
    } catch (error) {
      if (!isTransactionCommitted) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      session.endSession();
    }
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
