"use client";

import { useEffect, useState } from "react";
import type { Booking } from "@/lib/booking/server";
import { syncClient } from "@/lib/sync/client";
import { useSession } from "@/lib/sync/useSession";

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/** Upcoming expert calls. Renders nothing for non-admins; MembersTable explains access. */
export function BookingsTable() {
  const session = useSession();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!session.ready || !session.email) return;
    let cancelled = false;
    void (async () => {
      const { data } = await syncClient()!.auth.getSession();
      const response = await fetch("/api/admin/bookings", {
        headers: { Authorization: `Bearer ${data.session?.access_token ?? ""}` },
        cache: "no-store",
      });
      const body = await response.json().catch(() => ({}));
      if (cancelled) return;
      if (response.ok) setBookings(body.bookings);
      else if (body.error === "setup") setFailed(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [session.ready, session.email]);

  if (failed) {
    return (
      <p className="rounded-3xl border border-rule bg-sheet p-6 text-sm text-mute">
        Bookings aren&apos;t set up yet. Run <code>supabase/schema.sql</code> in the Supabase SQL editor.
      </p>
    );
  }
  if (!bookings) return null;

  return (
    <section aria-labelledby="bookings-heading">
      <h2 id="bookings-heading" className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
        Upcoming calls <span className="text-mute tabular-nums">{bookings.length}</span>
      </h2>
      {bookings.length === 0 ? (
        <p className="mt-4 text-mute">No calls booked yet.</p>
      ) : (
        <ul className="mt-5 divide-y divide-rule overflow-hidden rounded-3xl border border-rule bg-sheet">
          {bookings.map((booking) => (
            <li key={booking.id} className="grid gap-1 px-5 py-4 sm:grid-cols-12 sm:gap-6">
              <p className="tabular-nums sm:col-span-3">{when(booking.starts_at)}</p>
              <div className="min-w-0 sm:col-span-9">
                <p>
                  {booking.name}{" "}
                  <a href={`mailto:${booking.email}`} className="text-mute underline decoration-rule underline-offset-2 hover:text-ink">
                    {booking.email}
                  </a>
                </p>
                {booking.note ? <p className="mt-1 text-sm text-mute">{booking.note}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
