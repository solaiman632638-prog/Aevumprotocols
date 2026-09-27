import { NextResponse } from "next/server";
import { z } from "zod";
import { MAX_MESSAGE_CHARS, MAX_OUTPUT_TOKENS, modelFor } from "@/lib/ai/model-config";
import { aevumAnswerSchema, fallbackAnswer, type AevumAnswer } from "@/lib/aevum-ai/schema";
import {
  getCompoundProfile,
  getPairings,
  getReferenceRegimens,
  registerNames,
  symptomVocabulary,
} from "@/lib/aevum-ai/evidence";
import { checkRateLimit } from "@/lib/aevum-ai/rate-limit";
import { AEVUM_SYSTEM_PROMPT, REGIMEN_RULE } from "@/lib/aevum-ai/system-prompt";
import { detectRedFlags, URGENT_BANNER } from "@/lib/health/red-flags";
import { MissingKeyError, openaiClient } from "@/lib/openai/client";
import { calculateExposure, describeExposure, type RegimenEntry } from "@/lib/regimen/calculations";

export const runtime = "nodejs";

const entrySchema = z.object({
  compound: z.string().min(1).max(80),
  amount: z.number().positive().max(100_000),
  unit: z.enum(["mg", "mcg"]),
  administrationsPerWeek: z.number().int().min(0).max(21),
  days: z.array(z.string().max(12)).max(7).optional(),
});

const bodySchema = z.object({
  conversationId: z.string().max(64).optional(),
  message: z.string().min(1).max(MAX_MESSAGE_CHARS),
  symptoms: z.array(z.string().max(80)).max(20).optional(),
  regimen: z.array(entrySchema).max(20).optional(),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(12)
    .optional(),
});

/** Compound names the question mentions, matched against the register. */
function mentionedCompounds(message: string, regimen: RegimenEntry[]): string[] {
  const lower = message.toLowerCase();
  const hits = registerNames().filter((name) => lower.includes(name.toLowerCase()));
  const fromRegimen = regimen.map((entry) => entry.compound);
  return [...new Set([...hits, ...fromRegimen])].slice(0, 6);
}

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "That request could not be read." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const verdict = checkRateLimit(ip);
  if (!verdict.ok) {
    return NextResponse.json(
      { error: verdict.reason },
      { status: 429, headers: { "Retry-After": String(verdict.retryAfter) } },
    );
  }

  const regimen = (parsed.regimen ?? []) as RegimenEntry[];

  // Deterministic layers run first and their output is authoritative.
  const redFlags = detectRedFlags(parsed.message, parsed.symptoms);
  const exposures = regimen.map((entry) => ({
    compound: entry.compound,
    line: describeExposure(entry),
    ...calculateExposure(entry),
  }));

  // A red flag answers immediately. No model call, no waiting, no cost.
  if (redFlags.length > 0) {
    const answer: AevumAnswer = {
      ...fallbackAnswer(URGENT_BANNER.body),
      classification: { type: "urgent_flag" },
      risk: { level: "urgent", summary: URGENT_BANNER.heading },
      urgentRedFlags: redFlags.map((flag) => flag.title),
      clinicianQuestions: [
        "When did this start, and is it getting worse?",
        "What have you taken in the last 48 hours, and how much?",
      ],
    };
    return NextResponse.json({ answer, urgent: true });
  }

  const evidence = mentionedCompounds(parsed.message, regimen).map((name) => ({
    profile: getCompoundProfile(name),
    referenceRegimens: getReferenceRegimens(name),
    pairings: getPairings(name),
  }));

  const context = [
    exposures.length
      ? `USER-REPORTED REGIMEN (calculated by Aevum, quote exactly):\n${exposures.map((item) => item.line).join("\n")}\n${REGIMEN_RULE}`
      : "USER-REPORTED REGIMEN: none supplied.",
    evidence.length
      ? `REGISTER EVIDENCE:\n${JSON.stringify(evidence)}`
      : "REGISTER EVIDENCE: no compound in Aevum's register matched this question. Say so rather than answering from memory.",
    `SYMPTOM VOCABULARY: ${JSON.stringify(symptomVocabulary())}`,
  ].join("\n\n");

  const input = [
    ...(parsed.history ?? []).map((turn) => ({ role: turn.role, content: turn.content })),
    { role: "user" as const, content: `${context}\n\nQUESTION: ${parsed.message}` },
  ];

  try {
    const client = openaiClient();
    const answer = await ask(client, input);
    return NextResponse.json({ answer, urgent: false });
  } catch (error) {
    if (error instanceof MissingKeyError) {
      return NextResponse.json({ error: "Aevum AI is not configured on this deployment." }, { status: 503 });
    }
    // Never surface the provider's error text.
    console.error("aevum-ai: request failed");
    return NextResponse.json(
      { error: "Aevum AI couldn't complete this analysis. Please try again." },
      { status: 502 },
    );
  }
}

type Client = ReturnType<typeof openaiClient>;
type Input = { role: "user" | "assistant"; content: string }[];

/** One call, one retry on invalid output, then a safe fallback. */
async function ask(client: Client, input: Input): Promise<AevumAnswer> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await client.responses.create({
      model: modelFor("chat"),
      instructions: AEVUM_SYSTEM_PROMPT,
      input,
      store: false,
      max_output_tokens: MAX_OUTPUT_TOKENS,
      text: {
        format: {
          type: "json_schema",
          name: "aevum_answer",
          strict: false,
          schema: jsonSchema,
        },
      },
    });

    const raw = response.output_text;
    if (!raw) continue;
    try {
      return aevumAnswerSchema.parse(JSON.parse(raw));
    } catch {
      // Fall through to the retry.
    }
  }
  return fallbackAnswer("I couldn't verify enough evidence to answer this reliably.");
}

/** The response contract, as JSON Schema for the model. */
const jsonSchema = {
  type: "object",
  properties: {
    answer: { type: "string" },
    classification: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: [
            "general_information",
            "regimen_analysis",
            "side_effect_question",
            "evidence_question",
            "interaction_question",
            "urgent_flag",
          ],
        },
      },
      required: ["type"],
    },
    regimenSummary: {
      type: "array",
      items: {
        type: "object",
        properties: {
          compound: { type: "string" },
          reportedAmount: { type: "string" },
          reportedFrequency: { type: "string" },
          weeklyTotal: { type: "string" },
        },
        required: ["compound", "reportedAmount", "reportedFrequency", "weeklyTotal"],
      },
    },
    risk: {
      type: "object",
      properties: {
        level: { type: "string", enum: ["low", "moderate", "elevated", "urgent", "unknown"] },
        summary: { type: "string" },
      },
      required: ["level", "summary"],
    },
    sideEffects: {
      type: "array",
      items: {
        type: "object",
        properties: { name: { type: "string" }, severity: { type: "string" }, evidenceQuality: { type: "string" } },
        required: ["name", "severity", "evidenceQuality"],
      },
    },
    interactions: {
      type: "array",
      items: {
        type: "object",
        properties: { title: { type: "string" }, description: { type: "string" }, severity: { type: "string" } },
        required: ["title", "description", "severity"],
      },
    },
    referenceRegimens: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sourceType: { type: "string" },
          amount: { type: "string" },
          frequency: { type: "string" },
          duration: { type: "string" },
          population: { type: "string" },
          sourceId: { type: "string" },
        },
        required: ["sourceType", "amount", "frequency", "duration", "population", "sourceId"],
      },
    },
    monitoringConsiderations: { type: "array", items: { type: "string" } },
    urgentRedFlags: { type: "array", items: { type: "string" } },
    clinicianQuestions: { type: "array", items: { type: "string" } },
    evidenceLimitations: { type: "array", items: { type: "string" } },
    citations: {
      type: "array",
      items: {
        type: "object",
        properties: { sourceId: { type: "string" }, title: { type: "string" }, url: { type: "string" } },
        required: ["sourceId", "title", "url"],
      },
    },
  },
  required: ["answer", "classification", "risk"],
} as const;
