import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock/db";

export async function GET() {
  const calibration = await mockDb.getCalibration();
  return NextResponse.json(calibration);
}
