import { createClient, type User } from "@supabase/supabase-js";
import { hours } from "@/lib/booking/slots";
import { site } from "@/lib/site";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export type Booking = {
  id: string;
  starts_at: string;
  name: string;
  email: string;
  note: string | null;
  status: "booked" | "cancelled";
  created_at: string;
};

/** Emails allowed into /admin, from ADMIN_EMAILS (comma-separated). They also get every booking. */
export const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

/** The signed-in user behind a browser's Bearer token, checked by Supabase. */
export async function caller(request: Request): Promise<User | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!url || !anonKey || !token) return null;
  const { data } = await createClient(url, anonKey).auth.getUser(token);
  return data.user ?? null;
}

/** "Thursday, October 30 at 9:00 a.m. EDT", in the expert's zone. */
export function callTime(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: hours.timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Sends through Resend's API (the same account as the NovaEvum store). Without
 * RESEND_API_KEY it logs and skips, so a booking never fails over email.
 */
async function sendEmail(input: { to: string[]; subject: string; lines: string[]; replyTo?: string }): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key || input.to.length === 0) {
    console.info(`[booking] email skipped (no RESEND_API_KEY or recipient): ${input.subject}`);
    return;
  }
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">${input.lines
    .map((line) => `<p style="margin:0 0 12px">${escapeHtml(line)}</p>`)
    .join("")}</div>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? `${site.name} <onboarding@resend.dev>`,
      to: input.to,
      subject: input.subject,
      html,
      text: input.lines.join("\n\n"),
      reply_to: input.replyTo,
    }),
  }).catch((error: unknown) => ({ ok: false, status: 0, text: async () => String(error) }) as const);
  if (!response.ok) console.error(`[booking] email failed (${response.status}): ${await response.text()}`);
}

/** Who hears about bookings: BOOKING_NOTIFY_EMAIL if set, otherwise the admins. */
function notifyList(): string[] {
  const set = (process.env.BOOKING_NOTIFY_EMAIL ?? "").split(",").map((email) => email.trim()).filter(Boolean);
  return set.length > 0 ? set : adminEmails;
}

export async function emailBooked(booking: Booking): Promise<void> {
  const when = callTime(booking.starts_at);
  await Promise.all([
    sendEmail({
      to: notifyList(),
      subject: `New call booked: ${booking.name}, ${when}`,
      replyTo: booking.email,
      lines: [
        `${booking.name} booked a ${hours.callMinutes}-minute call.`,
        `When: ${when}`,
        `Email: ${booking.email}`,
        `Note: ${booking.note || "none"}`,
        `Reply to this email to reach them. All bookings: https://www.${site.domain}/admin`,
      ],
    }),
    sendEmail({
      to: [booking.email],
      subject: `Your ${site.name} call is booked: ${when}`,
      lines: [
        `Hi ${booking.name},`,
        `Your ${hours.callMinutes}-minute call is booked for ${when}. We'll email you the call details before then.`,
        `Need to cancel? Open https://www.${site.domain}/book and tap Cancel.`,
        `This call is not for emergencies. If you have severe or worsening symptoms, call emergency services.`,
      ],
    }),
  ]);
}

export async function emailCancelled(booking: Booking): Promise<void> {
  await sendEmail({
    to: notifyList(),
    subject: `Call cancelled: ${booking.name}, ${callTime(booking.starts_at)}`,
    replyTo: booking.email,
    lines: [`${booking.name} (${booking.email}) cancelled their call on ${callTime(booking.starts_at)}. The slot is open again.`],
  });
}
