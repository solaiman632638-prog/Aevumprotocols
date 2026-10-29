/**
 * When calls can be booked. Edit these to change the expert's hours; the
 * server checks every booking against the same rules.
 */
export const hours = {
  timeZone: "America/Toronto",
  /** 1 = Monday … 5 = Friday. */
  weekdays: [1, 2, 3, 4, 5],
  /** First and last start times, in the expert's local time (24h). */
  firstStart: { hour: 9, minute: 0 },
  lastStart: { hour: 16, minute: 30 },
  callMinutes: 30,
  daysAhead: 14,
  noticeHours: 24,
};

const MINUTE = 60_000;

/** The time zone's offset from UTC at that instant, in ms (Toronto in winter: -5h). */
function offsetAt(instant: number, timeZone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(instant))
      .map((part) => [part.type, part.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/** A wall-clock time in the time zone, as a UTC instant. Re-checks the offset across DST changes. */
function zonedTime(year: number, month: number, day: number, hour: number, minute: number, timeZone: string): number {
  const wall = Date.UTC(year, month, day, hour, minute);
  const first = wall - offsetAt(wall, timeZone);
  return wall - offsetAt(first, timeZone);
}

/** Every bookable start time from now, as ISO strings, oldest first. Taken slots are not removed here. */
export function openSlots(now = Date.now()): string[] {
  const { timeZone, weekdays, firstStart, lastStart, callMinutes, daysAhead, noticeHours } = hours;
  const earliest = now + noticeHours * 60 * MINUTE;
  const today = new Date(now + offsetAt(now, timeZone));
  const slots: string[] = [];

  for (let ahead = 0; ahead <= daysAhead; ahead++) {
    // Calendar day in the expert's zone, walked in UTC so local DST never skips a date.
    const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + ahead));
    if (!weekdays.includes(day.getUTCDay())) continue;
    const from = firstStart.hour * 60 + firstStart.minute;
    const to = lastStart.hour * 60 + lastStart.minute;
    for (let minutes = from; minutes <= to; minutes += callMinutes) {
      const start = zonedTime(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), Math.floor(minutes / 60), minutes % 60, timeZone);
      if (start >= earliest) slots.push(new Date(start).toISOString());
    }
  }
  return slots;
}

/** True when `iso` is exactly one of the bookable starts right now. */
export function isOpenSlot(iso: string, now = Date.now()): boolean {
  return openSlots(now).includes(iso);
}
