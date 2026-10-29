import { NextResponse } from "next/server";
import { caller, emailBooked, emailCancelled, type Booking } from "@/lib/booking/server";
import { isOpenSlot, openSlots } from "@/lib/booking/slots";
import { serviceClient } from "@/lib/health/server";

export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" };

/** The caller's next booked call, if any. */
async function upcoming(admin: NonNullable<ReturnType<typeof serviceClient>>, userId: string): Promise<Booking | null> {
  const { data } = await admin
    .from("aevum_bookings")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "booked")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(1)
    .maybeSingle();
  return (data as Booking | null) ?? null;
}

/** Open slots (taken ones removed, no one's details) and, when signed in, your own booking. */
export async function GET(request: Request) {
  const admin = serviceClient();
  if (!admin) return NextResponse.json({ error: "setup" }, { status: 503 });

  const slots = openSlots();
  const { data, error } = await admin
    .from("aevum_bookings")
    .select("starts_at")
    .eq("status", "booked")
    .gte("starts_at", slots[0] ?? new Date().toISOString());
  if (error) return NextResponse.json({ error: "setup" }, { status: 503 });

  const taken = new Set((data ?? []).map((row: { starts_at: string }) => new Date(row.starts_at).toISOString()));
  const user = await caller(request);
  const mine = user ? await upcoming(admin, user.id) : null;
  return NextResponse.json({ slots: slots.filter((slot) => !taken.has(slot)), mine }, { headers: noStore });
}

export async function POST(request: Request) {
  const admin = serviceClient();
  if (!admin) return NextResponse.json({ error: "setup" }, { status: 503 });
  const user = await caller(request);
  if (!user?.email) return NextResponse.json({ error: "signed-out" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { start?: unknown; name?: unknown; note?: unknown };
  const start = typeof body.start === "string" ? body.start : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 600) : "";
  if (!isOpenSlot(start)) return NextResponse.json({ error: "That time isn't available. Pick another." }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Add your name." }, { status: 400 });

  if (await upcoming(admin, user.id)) {
    return NextResponse.json({ error: "You already have a call booked. Cancel it to pick a new time." }, { status: 409 });
  }

  const { data, error } = await admin
    .from("aevum_bookings")
    .insert({ user_id: user.id, starts_at: start, name, email: user.email, note: note || null })
    .select("*")
    .single();
  if (error) {
    const taken = error.code === "23505";
    return NextResponse.json(
      { error: taken ? "Someone just booked that time. Pick another." : "Could not book. Try again." },
      { status: taken ? 409 : 500 },
    );
  }

  const booking = data as Booking;
  await emailBooked(booking);
  return NextResponse.json({ booking }, { headers: noStore });
}

/** Cancels the caller's upcoming call and frees the slot. */
export async function DELETE(request: Request) {
  const admin = serviceClient();
  if (!admin) return NextResponse.json({ error: "setup" }, { status: 503 });
  const user = await caller(request);
  if (!user) return NextResponse.json({ error: "signed-out" }, { status: 401 });

  const booking = await upcoming(admin, user.id);
  if (!booking) return NextResponse.json({ ok: true }, { headers: noStore });
  const { error } = await admin.from("aevum_bookings").update({ status: "cancelled" }).eq("id", booking.id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "Could not cancel. Try again." }, { status: 500 });

  await emailCancelled(booking);
  return NextResponse.json({ ok: true }, { headers: noStore });
}
