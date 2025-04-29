"use server";

import Material from "@/models/Material";
import connectDB from "@/lib/db";

export async function getMaterials() {
  try {
    await connectDB();
    const materials = await Material.find().populate("category");
    return JSON.parse(JSON.stringify(materials));
  } catch (error) {
    console.error("Error fetching materials:", error);
    return [];
  }
}

export async function getMaterialById(id: string) {
  try {
    await connectDB();
    const material = await Material.findById(id).populate("category");
    return JSON.parse(JSON.stringify(material));
  } catch (error) {
    console.error("Error fetching material:", error);
    return null;
  }
}

export async function deleteMaterial(id: string) {
  try {
    await connectDB();
    const deletedMaterial = await Material.findByIdAndDelete(id);

    if (!deletedMaterial) {
      return { success: false, message: "Material not found" };
    }

    return { success: true, data: JSON.parse(JSON.stringify(deletedMaterial)) };
  } catch (error) {
    console.error("Error deleting material:", error);
    return {
      success: false,
      message: "Failed to delete material",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
