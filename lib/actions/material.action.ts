"use server";

import Material from "@/models/Material";
import Category from "@/models/Category";
import connectDB from "@/lib/db";

export async function getMaterials(query: string = "") {
  try {
    await connectDB();

    const searchFilter = query
      ? {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { sku: { $regex: query, $options: "i" } },
          ],
        }
      : {};

    const materials = await Material.find(searchFilter)
      .populate("category")
      .sort({ createdAt: -1 });

    return JSON.parse(JSON.stringify(materials));
  } catch (error) {
    console.error("Error fetching materials:", error);
    return [];
  }
}

export async function getCategoriesCount() {
  try {
    await connectDB();
    const count = await Category.countDocuments();
    return count;
  } catch (error) {
    console.error("Error getting categories count:", error);
    return 0;
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
