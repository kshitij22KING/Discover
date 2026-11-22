import { NextResponse } from "next/server";
import { reset } from "@/lib/db";

export const dynamic = "force-dynamic";

// Demo helper: wipes swipes and matches so the flow can be run again.
export async function POST() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_RESET !== "1") {
    return NextResponse.json({ error: "disabled" }, { status: 403 });
  }
  reset();
  return NextResponse.json({ ok: true });
}
