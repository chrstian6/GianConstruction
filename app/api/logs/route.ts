import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Log from "@/models/Log";
import User from "@/models/user";

export async function GET() {
  try {
    await dbConnect();
    const logs = await Log.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();

    // Format logs to include user name and user_id
    const formattedLogs = await Promise.all(
      logs.map(async (log) => {
        const user = await User.findOne({ email: log.targetEmail }).select(
          "firstName lastName user_id"
        );
        const userName = user
          ? `${user.firstName} ${user.lastName}`
          : log.targetName || "Unknown User";
        const userId = user?.user_id || "N/A";
        return {
          ...log,
          action: `User ${userName} (ID: ${userId}) ${log.action
            .replace(`User ${log.targetEmail}`, "User")
            .trim()}`,
        };
      })
    );

    return NextResponse.json({ logs: formattedLogs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
