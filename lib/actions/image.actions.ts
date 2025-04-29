// lib/actions/supabase-image.actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function uploadImage(file: File): Promise<string> {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  // Verify admin role
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || user?.user_metadata?.role !== "admin") {
    throw new Error("Unauthorized: Only admins can upload images");
  }

  try {
    const fileExtension = file.name.split(".").pop();
    const fileName = `materials/${uuidv4()}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from("materials")
      .upload(fileName, file);

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("materials").getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error("Supabase upload error:", error);
    throw new Error(
      `Image upload failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
