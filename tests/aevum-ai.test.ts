import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateExposure,
  calculatePercentageChange,
  calculateTimeBetweenAdministrations,
  compareRegimens,
  describeExposure,
} from "../src/lib/regimen/calculations.ts";
import { detectRedFlags } from "../src/lib/health/red-flags.ts";
import { bestMatch, normalise, phrases, tolerance } from "../src/lib/aevum-ai/match.ts";
import { aevumAnswerSchema } from "../src/lib/aevum-ai/schema.ts";
import { checkRateLimit, resetRateLimits } from "../src/lib/aevum-ai/rate-limit.ts";

test("2.5 mg on two days is 5 mg a week", () => {
  const exposure = calculateExposure({
    compound: "Example",
    amount: 2.5,
    unit: "mg",
    administrationsPerWeek: 2,
    days: ["Monday", "Thursday"],
  });
  assert.equal(exposure.weeklyTotal, 5);
  assert.equal(exposure.administrationsPerWeek, 2);
});

test("named days win over a stated frequency", () => {
  const exposure = calculateExposure({
    compound: "Example",
    amount: 1,
    unit: "mg",
    administrationsPerWeek: 7,
    days: ["Monday", "Thursday", "Saturday"],
  });
  assert.equal(exposure.administrationsPerWeek, 3);
  assert.equal(exposure.weeklyTotal, 3);
});

test("float noise does not leak into totals", () => {
  const exposure = calculateExposure({ compound: "X", amount: 0.1, unit: "mg", administrationsPerWeek: 3 });
  assert.equal(exposure.weeklyTotal, 0.3);
});

test("5 to 10 mg a week is +5 and +100%", () => {
  const change = compareRegimens(
    "Example",
    { compound: "Example", amount: 5, unit: "mg", administrationsPerWeek: 1 },
    { compound: "Example", amount: 10, unit: "mg", administrationsPerWeek: 1 },
  );
  assert.equal(change.difference, 5);
  assert.equal(change.percentageChange, 100);
});

test("percentage change from zero is null, not Infinity", () => {
  assert.equal(calculatePercentageChange(0, 10), null);
});

test("spacing is null when nothing is administered", () => {
  assert.equal(calculateTimeBetweenAdministrations(0), null);
  assert.equal(calculateTimeBetweenAdministrations(2), 3.5);
});

test("the description the model is handed carries the computed total", () => {
  const line = describeExposure({
    compound: "Example",
    amount: 2.5,
    unit: "mg",
    administrationsPerWeek: 2,
    days: ["Monday", "Thursday"],
  });
  assert.match(line, /5 mg\/week/);
  assert.match(line, /Monday, Thursday/);
});

test("chest pain is an urgent red flag", () => {
  const flags = detectRedFlags("I have chest pain and feel like I may faint");
  const ids = flags.map((flag) => flag.ruleId);
  assert.ok(ids.includes("chest-pain"));
  assert.ok(ids.includes("fainting"));
  assert.ok(flags.every((flag) => flag.severity === "urgent"));
});

test("a denied symptom does not fire", () => {
  assert.equal(detectRedFlags("I have no chest pain today").length, 0);
});

test("ordinary questions raise nothing", () => {
  assert.equal(detectRedFlags("What does BPC-157 do?").length, 0);
});

test("structured symptoms are checked too", () => {
  const flags = detectRedFlags("logging today", ["Severe shortness of breath"]);
  assert.equal(flags[0]?.ruleId, "breathing");
});

test("an answer missing required parts is rejected", () => {
  assert.equal(aevumAnswerSchema.safeParse({ answer: "hi" }).success, false);
});

test("a valid answer parses and defaults the optional lists", () => {
  const parsed = aevumAnswerSchema.parse({
    answer: "Example.",
    classification: { type: "general_information" },
    risk: { level: "low", summary: "Nothing notable." },
  });
  assert.deepEqual(parsed.citations, []);
  assert.deepEqual(parsed.sideEffects, []);
});

test("a made-up risk level is rejected", () => {
  const result = aevumAnswerSchema.safeParse({
    answer: "x",
    classification: { type: "general_information" },
    risk: { level: "catastrophic", summary: "y" },
  });
  assert.equal(result.success, false);
});

test("rate limiting cuts in and is per key", () => {
  resetRateLimits();
  for (let i = 0; i < 12; i++) assert.equal(checkRateLimit("a").ok, true);
  assert.equal(checkRateLimit("a").ok, false);
  assert.equal(checkRateLimit("b").ok, true);
});

// The register names the matcher has to cope with in practice.
const NAMES = ["Tesamorelin", "Ipamorelin", "Semaglutide", "BPC-157", "TB-500", "GHK-Cu", "Sermorelin", "Retatrutide"];
const match = (text: string) => bestMatch(text, NAMES, (name) => [name]);

test("a misspelled compound still resolves", () => {
  assert.equal(match("tesamorline"), "Tesamorelin");
  assert.equal(match("Tesamorelin"), "Tesamorelin");
  assert.equal(match("semaglutid"), "Semaglutide");
  assert.equal(match("ipamorelan"), "Ipamorelin");
});

test("spacing and punctuation do not matter", () => {
  assert.equal(match("BPC 157"), "BPC-157");
  assert.equal(match("bpc157"), "BPC-157");
  assert.equal(match("ghk cu"), "GHK-Cu");
});

test("near-identical names are not confused with each other", () => {
  assert.equal(match("sermorelin"), "Sermorelin");
  assert.equal(match("tesamorelin"), "Tesamorelin");
});

test("a name that is genuinely absent still misses", () => {
  assert.equal(match("aspirin"), null);
  assert.equal(match("xyzzy"), null);
  assert.equal(match("ib"), null);
});

test("names are picked out of a sentence", () => {
  const found = phrases("what does tesamorline do and how does it compare to ipamorelin")
    .map(match)
    .filter(Boolean);
  assert.ok(found.includes("Tesamorelin"));
  assert.ok(found.includes("Ipamorelin"));
});

test("tolerance grows with the length of the name", () => {
  assert.equal(tolerance(4), 0);
  assert.equal(tolerance(7), 1);
  assert.equal(tolerance(11), 2);
  assert.equal(normalise("BPC-157"), "bpc157");
});
