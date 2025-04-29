"use server";

import Category from "@/models/Category";
import connectDB from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Schema for category validation
const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().max(200).optional(),
  parentCategory: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

// Get all categories
export async function getCategories() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 });
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Get category by ID
export async function getCategoryById(id: string) {
  try {
    await connectDB();
    const category = await Category.findById(id);
    return JSON.parse(JSON.stringify(category));
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

// Create a new category
export async function createCategory(formData: FormData) {
  await connectDB();

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    parentCategory: formData.get("parentCategory") || null,
    isActive: formData.get("isActive") === "on",
  };

  try {
    const newCategory = await Category.create(rawData);
    revalidatePath("/admin/inventory/materials/categories");
    return { success: true, data: JSON.parse(JSON.stringify(newCategory)) };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      message: "Failed to create category",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update a category
export async function updateCategory(id: string, formData: FormData) {
  await connectDB();

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    parentCategory: formData.get("parentCategory") || null,
    isActive: formData.get("isActive") === "on",
  };

  const validatedData = categorySchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      errors: validatedData.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      validatedData.data,
      { new: true }
    );

    if (!updatedCategory) {
      return { success: false, message: "Category not found" };
    }

    revalidatePath("/admin/inventory/materials/categories");
    revalidatePath(`/admin/inventory/materials/categories/${id}`);
    return { success: true, data: JSON.parse(JSON.stringify(updatedCategory)) };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      message: "Failed to update category",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Delete a category
export async function deleteCategory(id: string) {
  await connectDB();

  try {
    // Check if any materials are using this category
    const Material = (await import("@/models/Material")).default;
    const materialsCount = await Material.countDocuments({ category: id });

    if (materialsCount > 0) {
      return {
        success: false,
        message: "Cannot delete category with associated materials",
      };
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return { success: false, message: "Category not found" };
    }

    revalidatePath("/admin/inventory/materials/categories");
    return { success: true, data: JSON.parse(JSON.stringify(deletedCategory)) };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      message: "Failed to delete category",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get categories for dropdown (simplified format)
export async function getCategoriesForDropdown() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .select("_id name");

    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Error fetching categories for dropdown:", error);
    return [];
  }
}
