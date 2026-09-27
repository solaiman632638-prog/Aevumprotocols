import { z } from "zod";

/**
 * The shape every answer must take. Validated before anything reaches the
 * screen; a response that will not parse is retried once, then replaced with
 * a safe fallback rather than shown.
 */

export const severity = z.enum(["low", "moderate", "elevated", "urgent", "unknown"]);

export const evidenceQuality = z.enum([
  "Established",
  "Moderate",
  "Limited",
  "Very Limited",
  "No reliable human evidence located",
]);

export const aevumAnswerSchema = z.object({
  answer: z.string().min(1),
  classification: z.object({
    type: z.enum([
      "general_information",
      "regimen_analysis",
      "side_effect_question",
      "evidence_question",
      "interaction_question",
      "urgent_flag",
    ]),
  }),
  regimenSummary: z
    .array(
      z.object({
        compound: z.string(),
        reportedAmount: z.string(),
        reportedFrequency: z.string(),
        weeklyTotal: z.string(),
      }),
    )
    .default([]),
  risk: z.object({ level: severity, summary: z.string() }),
  sideEffects: z
    .array(
      z.object({
        name: z.string(),
        severity: z.string(),
        evidenceQuality: z.string(),
      }),
    )
    .default([]),
  interactions: z
    .array(z.object({ title: z.string(), description: z.string(), severity: z.string() }))
    .default([]),
  referenceRegimens: z
    .array(
      z.object({
        sourceType: z.string(),
        amount: z.string(),
        frequency: z.string(),
        duration: z.string(),
        population: z.string(),
        sourceId: z.string(),
      }),
    )
    .default([]),
  monitoringConsiderations: z.array(z.string()).default([]),
  urgentRedFlags: z.array(z.string()).default([]),
  clinicianQuestions: z.array(z.string()).default([]),
  evidenceLimitations: z.array(z.string()).default([]),
  citations: z
    .array(z.object({ sourceId: z.string(), title: z.string(), url: z.string() }))
    .default([]),
});

export type AevumAnswer = z.infer<typeof aevumAnswerSchema>;

/** Shown when the model cannot produce a valid answer twice running. */
export function fallbackAnswer(reason: string): AevumAnswer {
  return {
    answer: reason,
    classification: { type: "general_information" },
    regimenSummary: [],
    risk: { level: "unknown", summary: "No risk review was produced for this question." },
    sideEffects: [],
    interactions: [],
    referenceRegimens: [],
    monitoringConsiderations: [],
    urgentRedFlags: [],
    clinicianQuestions: [],
    evidenceLimitations: [],
    citations: [],
  };
}
