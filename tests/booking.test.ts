import assert from "node:assert/strict";
import test from "node:test";
import { isOpenSlot, openSlots } from "../src/lib/booking/slots.ts";

// Wednesday 2026-10-28, 10:00 in Toronto (EDT, UTC-4).
const now = Date.parse("2026-10-28T14:00:00Z");

test("first slot is the next weekday start at least 24 hours out", () => {
  // Thursday 10:00 is exactly 24h away; 10:00 EDT is 14:00 UTC.
  assert.equal(openSlots(now)[0], "2026-10-29T14:00:00.000Z");
});

test("no weekend slots, sixteen a weekday", () => {
  const slots = openSlots(now);
  const byDay = new Map<string, number>();
  for (const slot of slots) {
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", weekday: "short", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(slot));
    assert.ok(!/Sat|Sun/.test(day), `weekend slot ${slot}`);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  const full = [...byDay.values()].slice(1, -1);
  assert.ok(full.every((count) => count === 16));
});

test("follows the DST change: 9:00 is 13:00 UTC before and 14:00 UTC after Nov 1", () => {
  const slots = openSlots(now);
  assert.ok(slots.includes("2026-10-30T13:00:00.000Z")); // Fri 9:00 EDT
  assert.ok(slots.includes("2026-11-02T14:00:00.000Z")); // Mon 9:00 EST
  assert.ok(!slots.includes("2026-11-02T13:00:00.000Z"));
});

test("only exact starts are open", () => {
  assert.ok(isOpenSlot("2026-10-30T13:00:00.000Z", now));
  assert.ok(!isOpenSlot("2026-10-30T13:15:00.000Z", now));
  assert.ok(!isOpenSlot("2026-10-28T18:00:00.000Z", now)); // inside the 24h notice
});
