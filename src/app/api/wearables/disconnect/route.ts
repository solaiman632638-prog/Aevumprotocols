import { NextResponse } from "next/server";
import { GOOGLE_TOKEN, WHOOP_REFRESH, WHOOP_TOKEN } from "@/lib/wearables/oauth";

/** Forget every device token held in this browser's cookies. */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  for (const name of [WHOOP_TOKEN, WHOOP_REFRESH, GOOGLE_TOKEN]) response.cookies.delete(name);
  return response;
}
