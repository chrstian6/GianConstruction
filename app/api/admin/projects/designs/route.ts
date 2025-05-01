import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Design from "@/models/Design";
import mongoose from "mongoose";

export async function POST(request: Request) {
  // Initialize variables for connection tracking
  let isConnected = false;
  let connectionAttempts = 0;
  const MAX_RETRIES = 3;

  try {
    // Attempt database connection with retries
    while (!isConnected && connectionAttempts < MAX_RETRIES) {
      try {
        connectionAttempts++;
        await dbConnect();
        isConnected = true;
      } catch (connectionError) {
        console.error(`Connection attempt ${connectionAttempts} failed:`, connectionError);
        if (connectionAttempts >= MAX_RETRIES) {
          throw new Error("Failed to establish database connection after multiple attempts");
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * connectionAttempts));
      }
    }

    // Validate request body
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Request body must be JSON" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Required field validation
    const requiredFields = [
      'title', 
      'description', 
      'image', 
      'category', 
      'style', 
      'sqm', 
      'rooms', 
      'estimatedCost'
    ];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: "Missing required fields",
          missingFields
        },
        { status: 400 }
      );
    }

    // Numeric field validation
    const numericFields = ['sqm', 'rooms', 'estimatedCost'];
    const invalidNumbers = numericFields.filter(field => 
      isNaN(Number(body[field])) || !isFinite(body[field])
    );

    if (invalidNumbers.length > 0) {
      return NextResponse.json(
        { 
          error: "Invalid numeric values",
          invalidFields: invalidNumbers
        },
        { status: 400 }
      );
    }

    // Create new design document
    const newDesign = new Design({
      title: body.title,
      description: body.description,
      image: body.image,
      category: body.category,
      style: body.style,
      sqm: Number(body.sqm),
      rooms: Number(body.rooms),
      estimatedCost: Number(body.estimatedCost),
      isFeatured: Boolean(body.isFeatured || false),
      projectId: body.projectId ? new mongoose.Types.ObjectId(body.projectId) : undefined,
    });

    // Explicit validation
    const validationError = newDesign.validateSync();
    if (validationError) {
      const errors = Object.entries(validationError.errors).reduce(
        (acc, [key, error]) => ({ ...acc, [key]: (error as mongoose.Error.ValidatorError).message }),
        {}
      );
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    // Save with timeout
    const savedDesign = await Promise.race([
      newDesign.save(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Database operation timeout")), 10000)
      )
    ]);

    return NextResponse.json({
      success: true,
      data: savedDesign
    });

  } catch (error) {
    console.error("Error in design creation:", error);

    // Handle different error types
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    } else if (error instanceof mongoose.Error) {
      return NextResponse.json(
        { error: "Database error", details: error.message },
        { status: 503 }
      );
    } else if (error instanceof Error && error.message.includes("timeout")) {
      return NextResponse.json(
        { error: "Database operation timed out" },
        { status: 504 }
      );
    } else if (error instanceof Error && error.message.includes("connection")) {
      return NextResponse.json(
        { error: "Database connection failed", details: (error as Error).message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const designs = await Design.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: designs });
  } catch (error) {
    console.error("Error fetching designs:", error);
    return NextResponse.json(
      { error: "Failed to fetch designs" },
      { status: 500 }
    );
  }
}