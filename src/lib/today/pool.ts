import { guideForLibrary } from "@/lib/data/guides";
import { getEntry, worksheetFor } from "@/lib/data/library";
import { compoundsByGoal, type CompoundProtocol, type CompoundSource } from "@/lib/today/engine";

const amount = (mcg: number) => (mcg >= 1000 ? `${mcg / 1000} mg` : `${mcg} mcg (${mcg / 1000} mg)`);

function protocolFor(slug: string): CompoundProtocol | undefined {
  const guide = guideForLibrary(slug);
  if (!guide) return undefined;
  return {
    start: amount(guide.startDoseMcg),
    typical: guide.typical,
    route: guide.route,
    how: guide.dosing[0] ?? guide.typical,
    duration: guide.duration[0] ?? "",
  };
}

/** Server-only: the monographs the engine can pick, trimmed to what the cards show. */
export function compoundPool(): CompoundSource[] {
  const slugs = [...new Set(Object.values(compoundsByGoal).flat())];
  return slugs.flatMap((slug) => {
    const entry = getEntry(slug);
    if (!entry) return [];
    return [
      {
        slug: entry.slug,
        name: entry.name,
        legal: entry.legal,
        status: entry.status,
        approval: entry.approval,
        evidence: entry.evidence,
        researchScore: entry.researchScore,
        primaryUse: entry.primaryUse,
        effects: entry.effects,
        sideEffects: entry.sideEffects,
        boxedWarning: entry.boxedWarning,
        worksheet: worksheetFor(entry.slug),
        protocol: protocolFor(entry.slug),
      },
    ];
  });
}
