import OpenAI from "openai";

/** Server-only. Importing this from a client component is a build error. */
import "server-only";

let client: OpenAI | null = null;

export class MissingKeyError extends Error {
  constructor() {
    super("OPENAI_API_KEY is not set");
    this.name = "MissingKeyError";
  }
}

/** The shared OpenAI client, or a thrown MissingKeyError when unconfigured. */
export function openaiClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new MissingKeyError();
  client ??= new OpenAI({ apiKey });
  return client;
}

/** Whether Aevum AI is switched on for this deployment. */
export function aiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
