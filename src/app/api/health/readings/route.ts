import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/aevum-ai/rate-limit";
import { hashKey, serviceClient } from "@/lib/health/server";

export const runtime = "nodejs";

/**
 * Shortcuts sends Health values as numbers or as text such as "58 count/min"
 * or "42.5 ms", and as "" when the watch recorded nothing. Out of range is dropped.
 */
function reading(value: unknown, min: number, max: number): number | null {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n * 10) / 10 : null;
}

/** The Shortcut shows `message` as a notification, so failures carry one too. */
const fail = (message: string, status: number) => NextResponse.json({ error: message, message }, { status });

/** Called by the "Aevum Heart" iPhone Shortcut each morning. */
export async function POST(request: Request) {
  const admin = serviceClient();
  if (!admin) return fail("Aevum heart sync is not set up yet.", 503);

  const body = await request.json().catch(() => null);
  const key = typeof body?.key === "string" ? body.key.trim() : "";
  if (!key) return fail("Missing key. Link the Shortcut from the Today page.", 401);

  const hash = hashKey(key);
  const limit = checkRateLimit(`health:${hash}`);
  if (!limit.ok) return fail(limit.reason, 429);

  const { data: owner, error: lookup } = await admin.from("aevum_health_keys").select("user_id").eq("key_hash", hash).maybeSingle();
  if (lookup) return fail(lookup.message, 500);
  if (!owner) return fail("Unknown key. Link the Shortcut again from the Today page.", 401);

  const row = {
    user_id: owner.user_id,
    rhr: reading(body.rhr, 25, 200),
    hrv: reading(body.hrv, 1, 300),
    resp_rate: reading(body.resp, 4, 40),
  };
  if (row.rhr === null && row.hrv === null && row.resp_rate === null) {
    return fail("No heart data in Apple Health yet. Wear your watch overnight and try again.", 422);
  }

  const { error } = await admin.from("aevum_heart_readings").insert(row);
  if (error) return fail(error.message, 500);

  const parts = [row.rhr !== null && `resting HR ${row.rhr} bpm`, row.hrv !== null && `HRV ${row.hrv} ms`].filter(Boolean);
  return NextResponse.json({ ok: true, message: `Sent to Aevum: ${parts.join(", ") || "breathing rate"}.` });
}
