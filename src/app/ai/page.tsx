import type { Metadata } from "next";
import Link from "next/link";
import { AskAevum } from "@/components/ai/AskAevum";
import { aiConfigured } from "@/lib/openai/client";

export const metadata: Metadata = {
  title: "Aevum AI",
  description:
    "Ask about compounds, research, side effects, interactions, and the regimen you have logged. Educational only, never medical advice.",
};

export default function AiPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Evidence · Regimen · Research</p>
      <h1 className="mt-3 font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-6xl">
        Aevum AI
      </h1>
      <p className="mt-4 max-w-2xl text-mute">
        Understand your regimen, research, side effects, and evidence.
      </p>

      <div className="mt-8">
        {aiConfigured() ? (
          <AskAevum />
        ) : (
          <div className="rounded-3xl border border-rule bg-sheet p-6 sm:p-8">
            <p className="eyebrow">Not configured</p>
            <h2 className="mt-2 font-display text-3xl font-light tracking-[-0.03em]">Aevum AI is off</h2>
            <p className="mt-3 max-w-prose text-mute">
              Set <code className="font-mono text-sm text-ink">OPENAI_API_KEY</code> on the deployment to
              switch it on. Everything else on Aevum works without it.
            </p>
            <Link href="/today" className="btn-primary mt-6">
              Go to today&apos;s check-in
            </Link>
          </div>
        )}
      </div>

      <p className="mt-10 text-xs text-dim">
        Educational only, and not medical advice. Aevum AI does not prescribe, diagnose, or
        set doses.{" "}
        <Link href="/disclaimer" className="underline decoration-rule underline-offset-4">
          Full disclaimer
        </Link>
        .
      </p>
    </div>
  );
}
