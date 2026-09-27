/**
 * One place that decides which model runs. Nothing else names a model.
 *
 * `OPENAI_MODEL` wins when it is set, which is how you point Aevum at a
 * different model without touching code. The fallback is a small, cheap
 * model because almost every request here is short explanation over
 * evidence Aevum has already retrieved and arithmetic it has already done.
 */
const FALLBACK_MODEL = "gpt-4.1-mini";

export type Task = "chat" | "regimen" | "evidence" | "complex";

/**
 * The model for a task. Every task shares one model today; the parameter is
 * the seam for sending harder questions elsewhere without touching callers.
 */
const BY_TASK: Record<Task, string | undefined> = {
  chat: undefined,
  regimen: undefined,
  evidence: undefined,
  complex: process.env.OPENAI_MODEL_COMPLEX?.trim(),
};

export function modelFor(task: Task = "chat"): string {
  return BY_TASK[task] || process.env.OPENAI_MODEL?.trim() || FALLBACK_MODEL;
}

export const DEFAULT_MODEL = FALLBACK_MODEL;

/** Ceiling on generated tokens. Structured answers here are short by design. */
export const MAX_OUTPUT_TOKENS = 1200;

/** Longest question accepted, in characters. */
export const MAX_MESSAGE_CHARS = 2000;

/** Turns of prior conversation sent back to the model. */
export const HISTORY_TURNS = 6;
