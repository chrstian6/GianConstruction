import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

export async function POST(request: Request) {
  try {
    // Initialize Supabase Admin Client (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Never expose this in client-side
    );

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Upload to Supabase (RLS bypassed)
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from("gianconstruction")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("gianconstruction").getPublicUrl(data.path);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
