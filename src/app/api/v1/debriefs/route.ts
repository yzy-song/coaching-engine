import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock/db";

export async function POST(request: Request) {
  const body = await request.json();
  const response = await mockDb.createDebrief(body.text ?? "");
  return NextResponse.json(response, { status: 202 });
}
