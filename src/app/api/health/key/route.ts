import { NextResponse } from "next/server";
import { callerId, hashKey, newHealthKey, serviceClient } from "@/lib/health/server";

export const runtime = "nodejs";

/**
 * Issues the key the "Aevum Heart" Shortcut signs in with. A new key replaces
 * the old one, so linking a new phone unlinks the last. Only the hash is kept.
 */
export async function POST(request: Request) {
  const admin = serviceClient();
  if (!admin) return NextResponse.json({ error: "setup" }, { status: 503 });
  const userId = await callerId(request);
  if (!userId) return NextResponse.json({ error: "signed-out" }, { status: 401 });

  const key = newHealthKey();
  const { error } = await admin
    .from("aevum_health_keys")
    .upsert({ user_id: userId, key_hash: hashKey(key), created_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ key }, { headers: { "Cache-Control": "no-store" } });
}
