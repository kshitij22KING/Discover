import { NextResponse } from "next/server";
import { load, save } from "@/lib/db";
import { applySwipe } from "@/lib/logic";

export const dynamic = "force-dynamic";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const db = load();
  const { status, body: out } = applySwipe(db, body || {});
  if (status === 200) save(db);
  return NextResponse.json(out, { status });
}
