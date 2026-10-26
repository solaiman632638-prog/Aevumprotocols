import type { WorkoutDay } from "@/lib/train/types";

export const WORKOUTS_KEY = "aevum-workouts";
const CHANGE_EVENT = "aevum-storage";

/** Where saves are mirrored when signed in. Set by SyncBridge. */
let remote: ((day: WorkoutDay) => void) | null = null;

export function registerWorkoutRemote(next: ((day: WorkoutDay) => void) | null) {
  remote = next;
}

export function loadWorkoutMap(): Record<string, WorkoutDay> {
  try {
    const raw = window.localStorage.getItem(WORKOUTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, WorkoutDay>) : {};
  } catch {
    return {};
  }
}

/** Local write only. Sync uses this to apply downloaded days without echoing them back. */
export function storeWorkouts(map: Record<string, WorkoutDay>) {
  try {
    window.localStorage.setItem(WORKOUTS_KEY, JSON.stringify(map));
  } catch {
    // Private mode or full storage: the page still works for this visit.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveWorkoutDay(day: Omit<WorkoutDay, "updatedAt">) {
  const stamped = { ...day, updatedAt: new Date().toISOString() };
  storeWorkouts({ ...loadWorkoutMap(), [day.date]: stamped });
  remote?.(stamped);
}
