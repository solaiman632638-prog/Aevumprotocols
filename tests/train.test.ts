import assert from "node:assert/strict";
import test from "node:test";
import { ageFactor, getExercise, oneRepMax, rank } from "../src/lib/train/exercises.ts";

test("one rep is the max; five reps at 90 kg estimate 105 kg", () => {
  assert.equal(oneRepMax(100, 1), 100);
  assert.equal(oneRepMax(90, 5), 105);
});

test("a bodyweight bench ranks an 80 kg man as intermediate, middle of the pack", () => {
  const standing = rank(getExercise("bench")!, "male", 80, 30, 80);
  assert.equal(standing?.level, "Intermediate");
  assert.equal(standing?.percentile, 50);
  assert.deepEqual(standing?.next, { level: "Advanced", kg: 120 });
});

test("older lifters get credit for age", () => {
  assert.equal(ageFactor(30), 1);
  assert.ok(ageFactor(60) > 1.3);
  const young = rank(getExercise("squat")!, "female", 60, 30, 75)!;
  const older = rank(getExercise("squat")!, "female", 60, 60, 75)!;
  assert.ok(older.percentile > young.percentile);
});

test("lifts without standards are not ranked", () => {
  assert.equal(rank(getExercise("curl")!, "male", 80, 30, 50), null);
});
