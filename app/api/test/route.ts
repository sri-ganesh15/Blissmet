// app/api/test/route.ts
import connectDB from "@/lib/config/db";
import { NextResponse } from "next/server";

/**
 * ✅ REQUIRED to prevent build-time execution
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ message: "✅ Connected to MongoDB" });
  } catch (error) {
    return NextResponse.json(
      { error: "❌ Failed to connect" },
      { status: 500 }
    );
  }
}
