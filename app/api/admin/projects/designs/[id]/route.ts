import { NextResponse } from "next/server";
import Design from "@/models/Design";
import connectDB from "@/lib/db";
import { z } from "zod";

// Define available units
const availableUnits = [
  "piece",
  "kg",
  "meter",
  "liter",
  "square meter",
  "cubic meter",
  "set",
  "bundle",
  "roll",
  "bag",
];

// Define the material schema for validation
const materialSchema = z.object({
  name: z.string().min(1, "Material name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.enum(availableUnits as [string, ...string[]], {
    errorMap: () => ({ message: "Please select a valid unit" }),
  }),
  unitPrice: z.number().min(0, "Unit price must be positive"),
});

// Define the update schema for PUT requests
const updateDesignSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).optional(),
  description: z.string().min(1, "Description is required").max(500).optional(),
  images: z.array(z.string().url("Invalid image URL")).optional().nullable(),
  category: z
    .enum(["Residential", "Commercial", "Industrial", "Landscape"])
    .optional(),
  style: z
    .enum([
      "Modern",
      "Traditional",
      "Contemporary",
      "Minimalist",
      "Industrial",
      "Rustic",
    ])
    .optional(),
  sqm: z.number().min(10, "Must be at least 10 sqm").optional(),
  rooms: z.number().min(1, "Must have at least 1 room").optional(),
  estimatedCost: z.number().min(0, "Cost must be positive").optional(),
  isFeatured: z.boolean().optional(),
  materials: z.array(materialSchema).optional().nullable(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    if (!params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: "Invalid design ID" }, { status: 400 });
    }

    const design = await Design.findById(params.id);
    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }
    return NextResponse.json(design);
  } catch (error) {
    console.error("GET error:", error);
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
    if (!params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: "Invalid design ID" }, { status: 400 });
    }

    const body = await req.json();

    // Validate the request body
    const validatedData = updateDesignSchema.parse(body);

    // Ensure materials are properly formatted
    const updateData = {
      ...validatedData,
      materials: validatedData.materials
        ? validatedData.materials.map((material) => ({
            name: material.name,
            quantity: material.quantity,
            unit: material.unit,
            unitPrice: material.unitPrice,
          }))
        : undefined,
    };

    const design = await Design.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: design });
  } catch (error) {
    console.error("Update error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update design",
      },
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
    if (!params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: "Invalid design ID" }, { status: 400 });
    }

    const design = await Design.findByIdAndDelete(params.id);
    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete design" },
      { status: 500 }
    );
  }
}
