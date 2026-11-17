import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/health/server";
import { labGoals } from "@/lib/labs";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Adds an email to the Labs waitlist. Signing up twice is not an error. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "bad-request" }, { status: 400 });

  // Bots fill every field; people never see this one.
  if (typeof body.website === "string" && body.website) return NextResponse.json({ ok: true });

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!emailPattern.test(email) || email.length > 254) {
    return NextResponse.json({ error: "email" }, { status: 400 });
  }
  const goal = labGoals.some((item) => item.key === body.goal) ? (body.goal as string) : null;

  const db = serviceClient();
  if (!db) return NextResponse.json({ error: "setup" }, { status: 503 });

  const { error } = await db.from("aevum_labs_waitlist").insert({ email, goal });
  // 23505: already on the list, which is fine.
  if (error && error.code !== "23505") {
    console.error("labs waitlist insert failed", error.message);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
