/** One logged set group: the same weight for `sets` sets of `reps`. Weight is always kg. */
export type LiftEntry = {
  id: string;
  exercise: string;
  weightKg: number;
  reps: number;
  sets: number;
};

/** Everything lifted on one calendar day. Kept even when emptied, so deletes sync. */
export type WorkoutDay = {
  date: string;
  updatedAt?: string;
  lifts: LiftEntry[];
};
