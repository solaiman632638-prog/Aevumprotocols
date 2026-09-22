"use client";

import { useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** A repeating calendar event is the lightest reminder that works on every phone. */
function buildIcs(time: string, url: string): string {
  const [hour, minute] = time.split(":").map(Number);
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const local = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(hour)}${pad(minute)}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Aevum//Daily check-in//EN",
    "BEGIN:VEVENT",
    `UID:aevum-daily-checkin-${stamp}@aevum`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${local}`,
    "DURATION:PT5M",
    "RRULE:FREQ=DAILY",
    "SUMMARY:Aevum check-in",
    `DESCRIPTION:Log last night's sleep and how you feel: ${url}`,
    `URL:${url}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:PT0M",
    "DESCRIPTION:Aevum check-in",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function DailyReminder() {
  const [time, setTime] = useState("07:30");
  const [added, setAdded] = useState(false);

  function download() {
    const url = `${window.location.origin}/today`;
    const blob = new Blob([buildIcs(time, url)], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "aevum-daily-check-in.ics";
    link.click();
    URL.revokeObjectURL(link.href);
    setAdded(true);
  }

  return (
    <section aria-labelledby="reminder-heading" className="rounded-3xl border border-rule bg-sheet p-5 sm:p-6">
      <h2 id="reminder-heading" className="font-display text-2xl font-light tracking-[-0.02em]">
        Daily reminder
      </h2>
      <p className="mt-2 max-w-prose text-sm text-mute">
        Add a repeating event to your phone&apos;s calendar so you never miss a
        check-in. Tap it each morning to jump straight here.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="reminder-time" className="mb-1.5 block text-sm">Time</label>
          <input
            id="reminder-time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value || "07:30")}
            className="rounded-xl border border-rule bg-paper px-3 py-2.5 text-sm outline-none focus:border-pine"
          />
        </div>
        <button type="button" onClick={download} className="btn-secondary">
          Add to calendar
        </button>
      </div>
      {added ? (
        <p className="mt-3 text-sm text-mute" role="status">
          Downloaded. Open the file to add it to your calendar.
        </p>
      ) : null}
      <p className="mt-4 text-xs text-mute">
        Tip: add Aevum to your home screen from your browser&apos;s share menu and
        it opens like an app.
      </p>
    </section>
  );
}
