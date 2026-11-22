import { NextResponse } from "next/server";
import { load } from "@/lib/db";
import { getFeed } from "@/lib/logic";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ profiles: getFeed(load()) });
}
