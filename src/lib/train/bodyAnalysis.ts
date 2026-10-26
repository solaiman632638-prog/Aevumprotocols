import type { Muscle } from "@/lib/train/exercises";

export const BODY_KEY = "aevum-body-analysis";

/** The last photo analysis, kept on this device only. The photo itself is never kept. */
export type SavedAnalysis = {
  date: string;
  summary: string;
  focus: { muscle: Muscle; reason: string }[];
  strengths: Muscle[];
};

export function saveAnalysis(analysis: SavedAnalysis) {
  try {
    window.localStorage.setItem(BODY_KEY, JSON.stringify(analysis));
  } catch {
    // Storage blocked: the result still shows for this visit.
  }
  window.dispatchEvent(new Event("aevum-storage"));
}
