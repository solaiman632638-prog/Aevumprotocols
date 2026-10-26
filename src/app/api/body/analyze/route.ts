import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/aevum-ai/rate-limit";
import { modelFor } from "@/lib/ai/model-config";
import { callerId } from "@/lib/health/server";
import { MissingKeyError, openaiClient } from "@/lib/openai/client";
import { muscles } from "@/lib/train/exercises";

export const runtime = "nodejs";

/** A resized JPEG from the browser; anything bigger is not a phone photo we asked for. */
const MAX_IMAGE_CHARS = 3_000_000;

const muscleSlugs = muscles.map((muscle) => muscle.slug) as [string, ...string[]];

const resultSchema = z.object({
  usable: z.boolean(),
  reason: z.string(),
  focus: z.array(z.object({ muscle: z.enum(muscleSlugs), reason: z.string() })).max(3),
  strengths: z.array(z.enum(muscleSlugs)).max(3),
  summary: z.string(),
});

export type BodyAnalysis = z.infer<typeof resultSchema>;

const instructions = `You look at a physique photo for a fitness app and say which muscle groups to train more, nothing else.

Compare muscle groups with each other on this one body: which look less developed relative to the rest (focus), and which are clearly ahead (strengths). Use only these muscle groups: ${muscles.map((m) => `${m.slug} (${m.name})`).join(", ")}. Give at most three focus areas, each with one short, plain reason that points to what you can see (for example "shoulders look narrow next to the chest and arms").

Rules:
- Neutral, encouraging language. Never comment on body fat, weight, attractiveness, skin, or health, and never diagnose anything.
- If the photo is not one adult's body in training clothes with the muscles visible, or it shows nudity or someone who may be under 18, set usable to false, explain why in reason, and leave focus and strengths empty.
- If only part of the body is visible, only judge what you can see and say so in summary.
- summary is one or two sentences.`;

const jsonSchema = {
  type: "object",
  properties: {
    usable: { type: "boolean" },
    reason: { type: "string" },
    focus: {
      type: "array",
      items: {
        type: "object",
        properties: { muscle: { type: "string", enum: muscleSlugs }, reason: { type: "string" } },
        required: ["muscle", "reason"],
        additionalProperties: false,
      },
    },
    strengths: { type: "array", items: { type: "string", enum: muscleSlugs } },
    summary: { type: "string" },
  },
  required: ["usable", "reason", "focus", "strengths", "summary"],
  additionalProperties: false,
};

/** Looks at one photo and returns muscle groups to emphasise. The photo is not stored. */
export async function POST(request: Request) {
  const userId = await callerId(request);
  if (!userId) return NextResponse.json({ error: "Log in to use body analysis." }, { status: 401 });

  const limit = checkRateLimit(`body:${userId}`);
  if (!limit.ok) return NextResponse.json({ error: limit.reason }, { status: 429 });

  const body = await request.json().catch(() => null);
  const image = typeof body?.image === "string" ? body.image : "";
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(image) || image.length > MAX_IMAGE_CHARS) {
    return NextResponse.json({ error: "Upload a JPEG or PNG photo." }, { status: 400 });
  }

  try {
    const response = await openaiClient().responses.create({
      model: modelFor("chat"),
      instructions,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Which muscle groups should this person focus on?" },
            { type: "input_image", image_url: image, detail: "auto" },
          ],
        },
      ],
      store: false,
      max_output_tokens: 600,
      text: { format: { type: "json_schema", name: "body_analysis", strict: true, schema: jsonSchema } },
    });
    const parsed = resultSchema.safeParse(JSON.parse(response.output_text || "null"));
    if (!parsed.success) return NextResponse.json({ error: "Could not read that photo. Try another." }, { status: 502 });
    return NextResponse.json({ analysis: parsed.data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof MissingKeyError) return NextResponse.json({ error: "Body analysis is not switched on yet." }, { status: 503 });
    console.error(`body-analysis: provider failed status=${(error as { status?: number })?.status ?? "none"}`);
    return NextResponse.json({ error: "Body analysis failed. Please try again." }, { status: 502 });
  }
}
