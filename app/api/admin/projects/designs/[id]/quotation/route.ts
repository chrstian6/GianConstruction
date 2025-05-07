import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Quotation from "@/models/Quotation";
import mongoose from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid design ID" }, { status: 400 });
    }

    const quotation = await Quotation.findOne({
      designId: new mongoose.Types.ObjectId(params.id),
    }).select("materials totalCost");

    if (!quotation) {
      return NextResponse.json(
        { error: "No quotation found for this design" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: quotation });
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotation" },
      { status: 500 }
    );
  }
}
