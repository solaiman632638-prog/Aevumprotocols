/** Goals people can pick when joining the Labs waitlist. Shared by the form and the API. */
export const labGoals = [
  { key: "recovery", label: "Recovery & repair" },
  { key: "strength", label: "Strength & lean mass" },
  { key: "endurance", label: "Engine & endurance" },
  { key: "sleep", label: "Sleep & regeneration" },
  { key: "focus", label: "Focus & composure" },
  { key: "weight", label: "Making weight" },
] as const;

export type WaitlistEntry = { email: string; goal: string | null; created_at: string };
