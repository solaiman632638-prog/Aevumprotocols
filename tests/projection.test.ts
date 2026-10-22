import assert from "node:assert/strict";
import test from "node:test";
import { projectWeight } from "../src/lib/today/projection.ts";

const today = "2026-10-22";
const series = (start: number, perDay: number, dates: string[]) =>
  dates.map((date, i) => ({ date, weightKg: start + perDay * i * 7 }));

test("no target means no projection", () => {
  assert.deepEqual(projectWeight([], undefined, today), { status: "no-target" });
});

test("needs three weigh-ins across a week", () => {
  const result = projectWeight(
    [
      { date: "2026-10-20", weightKg: 90 },
      { date: "2026-10-22", weightKg: 89.8 },
    ],
    80,
    today,
  );
  assert.equal(result.status, "not-enough");
});

test("losing 0.5 kg a week towards a 5 kg gap lands about ten weeks out", () => {
  const result = projectWeight(series(86.5, -0.5 / 7, ["2026-10-01", "2026-10-08", "2026-10-15", "2026-10-22"]), 80, today);
  assert.equal(result.status, "on-track");
  if (result.status !== "on-track") return;
  assert.equal(result.kgPerWeek, -0.5);
  assert.equal(result.currentKg, 85);
  assert.equal(result.weeks, 10);
  assert.equal(result.eta, "2026-12-31");
});

test("gaining while the target is lower reads as moving away", () => {
  const result = projectWeight(series(85, 0.4 / 7, ["2026-10-08", "2026-10-15", "2026-10-22"]), 80, today);
  assert.equal(result.status, "away");
});

test("a steady weight reads as flat", () => {
  const result = projectWeight(series(85, 0, ["2026-10-08", "2026-10-15", "2026-10-22"]), 80, today);
  assert.equal(result.status, "flat");
});

test("within half a kilo of target is reached", () => {
  const result = projectWeight(series(80.3, 0, ["2026-10-08", "2026-10-15", "2026-10-22"]), 80, today);
  assert.equal(result.status, "reached");
});

test("weigh-ins older than four weeks are ignored", () => {
  const result = projectWeight(
    [
      { date: "2026-08-01", weightKg: 100 },
      { date: "2026-10-20", weightKg: 85 },
      { date: "2026-10-22", weightKg: 85 },
    ],
    80,
    today,
  );
  assert.equal(result.status, "not-enough");
});
