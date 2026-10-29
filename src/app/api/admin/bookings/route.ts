import { NextResponse } from "next/server";
import { adminEmails, caller, type Booking } from "@/lib/booking/server";
import { serviceClient } from "@/lib/health/server";

export const runtime = "nodejs";

/** Every booked call from yesterday on, soonest first. Admins only. */
export async function GET(request: Request) {
  const admin = serviceClient();
  if (!admin || adminEmails.length === 0) return NextResponse.json({ error: "setup" }, { status: 503 });

  const user = await caller(request);
  const email = user?.email?.toLowerCase();
  if (!email) return NextResponse.json({ error: "signed-out" }, { status: 401 });
  if (!adminEmails.includes(email)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data, error } = await admin
    .from("aevum_bookings")
    .select("*")
    .eq("status", "booked")
    .gte("starts_at", new Date(Date.now() - 86_400_000).toISOString())
    .order("starts_at");
  if (error) return NextResponse.json({ error: "setup" }, { status: 503 });

  return NextResponse.json({ bookings: (data ?? []) as Booking[] }, { headers: { "Cache-Control": "no-store" } });
}
