import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Quotation from "@/models/Quotation";
import Design from "@/models/Design";
import mongoose from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    console.log(`[GET /api/admin/projects/design/${params.id}/quotation] Fetching quotation for designId: ${params.id}`);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.log(`[GET /api/admin/projects/design/${params.id}/quotation] Invalid design ID: ${params.id}`);
      return NextResponse.json({ error: "Invalid design ID" }, { status: 400 });
    }

    // Check if design exists
    const design = await Design.findById(params.id);
    if (!design) {
      console.log(`[GET /api/admin/projects/design/${params.id}/quotation] Design not found for ID: ${params.id}`);
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    const quotation = await Quotation.findOne({
      designId: new mongoose.Types.ObjectId(params.id),
    }).select("materials totalCost");

    if (!quotation) {
      console.log(`[GET /api/admin/projects/design/${params.id}/quotation] No quotation found for designId: ${params.id}`);
      return NextResponse.json(
        { error: "No quotation found for this design" },
        { status: 404 }
      );
    }

    console.log(`[GET /api/admin/projects/design/${params.id}/quotation] Quotation found:`, quotation);
    return NextResponse.json({ success: true, data: quotation });
  } catch (error) {
    console.error(`[GET /api/admin/projects/design/${params.id}/quotation] Error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch quotation" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    console.log(`[POST /api/admin/projects/design/${params.id}/quotation] Creating/updating quotation for designId: ${params.id}`);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.log(`[POST /api/admin/projects/design/${params.id}/quotation] Invalid design ID: ${params.id}`);
      return NextResponse.json({ error: "Invalid design ID" }, { status: 400 });
    }

    // Check if design exists
    const design = await Design.findById(params.id);
    if (!design) {
      console.log(`[POST /api/admin/projects/design/${params.id}/quotation] Design not found for ID: ${params.id}`);
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    const body = await request.json();
    const { materials } = body;

    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      console.log(`[POST /api/admin/projects/design/${params.id}/quotation] Invalid or empty materials array`);
      return NextResponse.json(
        { error: "Materials array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Validate materials
    for (const item of materials) {
      if (
        !item.name ||
        typeof item.quantity !== "number" ||
        !item.unit ||
        typeof item.unitPrice !== "number"
      ) {
        console.log(`[POST /api/admin/projects/design/${params.id}/quotation] Invalid material format:`, item);
        return NextResponse.json(
          { error: "Each material must have name, quantity, unit, and unitPrice" },
          { status: 400 }
        );
      }
    }

    // Calculate total cost
    const totalCost = materials.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0
    );

    // Create or update quotation
    const quotation = await Quotation.findOneAndUpdate(
      { designId: params.id },
      {
        designId: new mongoose.Types.ObjectId(params.id),
        materials,
        totalCost,
      },
      { upsert: true, new: true, runValidators: true }
    );

    console.log(`[POST /api/admin/projects/design/${params.id}/quotation] Quotation created/updated:`, quotation);
    return NextResponse.json({ success: true, data: quotation });
  } catch (error) {
    console.error(`[POST /api/admin/projects/design/${params.id}/quotation] Error:`, error);
    return NextResponse.json(
      { error: "Failed to create/update quotation" },
      { status: 500 }
    );
  }
}