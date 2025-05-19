import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Log from "@/models/Log";

export async function GET() {
  try {
    await dbConnect();
    const logs = await Log.find().sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
