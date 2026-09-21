import { calculateRecon } from "@/lib/calc";
import { getProtocol } from "@/lib/data/protocols";
import type {
  GoalId,
  PeptideRec,
  PlanProfile,
  PlanResult,
  RiskLevel,
  SupplementRec,
} from "@/lib/plan/types";

const MAX_PEPTIDES: Record<RiskLevel, number> = {
  conservative: 1,
  moderate: 2,
  aggressive: 3,
};

type Candidate = {
  slug: string;
  goal: GoalId;
  minRisk: RiskLevel;
  why: string;
};

const RISK_RANK: Record<RiskLevel, number> = {
  conservative: 0,
  moderate: 1,
  aggressive: 2,
};

function allowed(min: RiskLevel, chosen: RiskLevel): boolean {
  return RISK_RANK[chosen] >= RISK_RANK[min];
}

function candidatesFor(goal: GoalId): Candidate[] {
  switch (goal) {
    case "recovery":
      return [
        {
          slug: "bpc-157",
          goal,
          minRisk: "conservative",
          why: "Single-compound recovery worksheet at a daily microgram amount.",
        },
        {
          slug: "wolverine-stack",
          goal,
          minRisk: "moderate",
          why: "BPC-157 and TB-500 in one vial so the ratio stays fixed.",
        },
      ];
    case "fat-loss":
      return [
        {
          slug: "mots-c",
          goal,
          minRisk: "moderate",
          why: "Mitochondrial peptide used in metabolic research, a few times a week.",
        },
        {
          slug: "tirzepatide",
          goal,
          minRisk: "aggressive",
          why: "Weekly dual-agonist titration. Start at the first step and stay there.",
        },
      ];
    case "muscle":
      return [
        {
          slug: "ipamorelin",
          goal,
          minRisk: "conservative",
          why: "Short secretagogue pulses; the smallest GH-axis worksheet.",
        },
        {
          slug: "cjc-1295",
          goal,
          minRisk: "moderate",
          why: "No-DAC CJC plus Ipamorelin in one evening pulse.",
        },
        {
          slug: "tesamorelin",
          goal,
          minRisk: "aggressive",
          why: "Daily milligram GHRH analog. Do not also run the CJC blend.",
        },
      ];
    case "skin":
      return [
        {
          slug: "ghk-cu",
          goal,
          minRisk: "conservative",
          why: "Copper tripeptide, daily, at a modest milligram amount.",
        },
        {
          slug: "klow",
          goal,
          minRisk: "aggressive",
          why: "Four-peptide aesthetic/recovery blend. Replaces GHK-Cu plus extra BPC/TB.",
        },
      ];
    case "sleep":
      return [
        {
          slug: "dsip",
          goal,
          minRisk: "moderate",
          why: "Evening nonapeptide at a very small draw. Easy to overshoot.",
        },
      ];
    case "cognition":
      return [
        {
          slug: "semax",
          goal,
          minRisk: "conservative",
          why: "Daytime nasal ACTH analog. Count actuations against concentration.",
        },
        {
          slug: "selank",
          goal,
          minRisk: "moderate",
          why: "Paired with Semax in short cognitive blocks, not a substitute for it.",
        },
      ];
    case "longevity":
      return [
        {
          slug: "mots-c",
          goal,
          minRisk: "moderate",
          why: "Cellular-stress peptide, two or three times a week.",
        },
        {
          slug: "nad-plus",
          goal,
          minRisk: "aggressive",
          why: "High-milligram cofactor draws. Sting is common; dilute if needed.",
        },
      ];
    case "libido":
      return [
        {
          slug: "pt-141",
          goal,
          minRisk: "aggressive",
          why: "As-needed only. First amount is the low end of the sheet.",
        },
      ];
  }
}

function pickDose(risk: RiskLevel, protocolSlug: string): {
  amount: string;
  frequency: string;
  doseMcg: number;
} {
  const protocol = getProtocol(protocolSlug);
  if (!protocol) {
    return { amount: "see sheet", frequency: "see sheet", doseMcg: 0 };
  }
  const index =
    risk === "conservative"
      ? 0
      : risk === "aggressive"
        ? protocol.doses.length - 1
        : Math.floor((protocol.doses.length - 1) / 2);
  const row = protocol.doses[index] ?? protocol.doses[0];
  return {
    amount: row.amount,
    frequency: row.frequency,
    doseMcg: protocol.doseMcg,
  };
}

function toRec(candidate: Candidate, risk: RiskLevel): PeptideRec | null {
  const protocol = getProtocol(candidate.slug);
  if (!protocol) return null;
  const dose = pickDose(risk, candidate.slug);
  return {
    slug: protocol.slug,
    name: protocol.name,
    goal: candidate.goal,
    amount: dose.amount,
    frequency: dose.frequency,
    doseMcg: dose.doseMcg,
    vialMg: protocol.vialMg,
    waterMl: protocol.typicalWaterMl,
    why: candidate.why,
  };
}

function covers(existing: PeptideRec[], slug: string): boolean {
  if (existing.some((item) => item.slug === slug)) return true;
  if (slug === "bpc-157" || slug === "tb-500") {
    return existing.some((item) => item.slug === "wolverine-stack" || item.slug === "klow");
  }
  if (slug === "ghk-cu" || slug === "kpv") {
    return existing.some((item) => item.slug === "klow");
  }
  if (slug === "ipamorelin") {
    return existing.some((item) => item.slug === "cjc-1295");
  }
  if (slug === "mots-c") {
    return existing.some((item) => item.slug === "tirzepatide" || item.slug === "nad-plus");
  }
  return false;
}

function conflicts(existing: PeptideRec[], slug: string): boolean {
  const slugs = new Set(existing.map((item) => item.slug));
  if (slug === "tesamorelin" && slugs.has("cjc-1295")) return true;
  if (slug === "cjc-1295" && slugs.has("tesamorelin")) return true;
  if (slug === "klow" && (slugs.has("ghk-cu") || slugs.has("wolverine-stack"))) return true;
  if ((slug === "ghk-cu" || slug === "wolverine-stack") && slugs.has("klow")) return true;
  return false;
}

function supplementsFor(profile: PlanProfile, peptides: PeptideRec[]): SupplementRec[] {
  const set = new Map<string, SupplementRec>();
  const add = (item: SupplementRec) => {
    if (!set.has(item.name)) set.set(item.name, item);
  };

  add({
    name: "Vitamin D3",
    amount: "2,000–4,000 IU",
    timing: "With a meal that has fat",
    why: "Baseline for almost every research block on this catalog.",
  });
  add({
    name: "Magnesium glycinate",
    amount: "200–400 mg elemental",
    timing: "Evening",
    why: "Sleep, recovery, and a calmer evening GH pulse window.",
  });
  add({
    name: "Omega-3 (EPA/DHA)",
    amount: "1–2 g combined EPA+DHA",
    timing: "With food",
    why: "Inflammation and lipids while a recovery or metabolic sheet is running.",
  });

  if (profile.goals.includes("recovery") || profile.goals.includes("skin")) {
    add({
      name: "Collagen peptides + vitamin C",
      amount: "10–15 g collagen, 250–500 mg vitamin C",
      timing: "Morning",
      why: "Substrate beside BPC-157 / GHK-Cu worksheets, not a substitute.",
    });
  }
  if (profile.goals.includes("muscle") || profile.goals.includes("fat-loss")) {
    add({
      name: "Creatine monohydrate",
      amount: "5 g",
      timing: "Daily, any time",
      why: "Training output while a GH-axis or metabolic sheet is on.",
    });
    add({
      name: "Protein",
      amount: "1.6–2.2 g/kg body mass",
      timing: "Spread across the day",
      why: "The worksheets do not replace food. This is the floor.",
    });
  }
  if (profile.goals.includes("sleep") || profile.goals.includes("muscle")) {
    add({
      name: "Glycine",
      amount: "3 g",
      timing: "30–60 minutes before bed",
      why: "Pairs with DSIP or an evening secretagogue without adding another vial.",
    });
  }
  if (profile.goals.includes("libido") || profile.goals.includes("skin")) {
    add({
      name: "Zinc",
      amount: "15–30 mg",
      timing: "With food, not stacked on copper-heavy days blindly",
      why: "Skin and androgen research staple. GHK-Cu already carries copper.",
    });
  }
  if (
    profile.goals.includes("fat-loss") &&
    peptides.some((item) => item.slug === "tirzepatide" || item.slug === "retatrutide")
  ) {
    add({
      name: "Electrolytes",
      amount: "Sodium-forward mix, to thirst and urine colour",
      timing: "Across the day",
      why: "Weekly incretin sheets commonly drop intake. Do not chase this with more peptide.",
    });
  }
  if (profile.risk !== "conservative" && profile.goals.includes("fat-loss")) {
    add({
      name: "Berberine",
      amount: "500 mg",
      timing: "With the largest carbohydrate meal",
      why: "Metabolic adjunct when MOTS-c or a GLP-1 sheet is already the peptide.",
    });
  }
  if (profile.goals.includes("cognition")) {
    add({
      name: "EPA-heavy fish oil",
      amount: "Covered by the omega-3 row if EPA is ≥1 g",
      timing: "With food",
      why: "Do not add a second fish-oil product on top of the omega-3 already listed.",
    });
  }

  return [...set.values()];
}

export function buildPlan(profile: PlanProfile): PlanResult {
  if (profile.goals.length === 0) {
    return {
      blocked: true,
      blockReason: "Pick at least one goal.",
      title: "No worksheet yet",
      summary: "Choose a goal so the matcher has something to rank.",
      peptides: [],
      supplements: [],
      holdWhen: "",
      notes: [],
    };
  }

  if (profile.ageBand === "under-21" || profile.flags.includes("pregnant")) {
    const reason =
      profile.ageBand === "under-21"
        ? "This matcher will not emit peptide worksheets under 21."
        : "Pregnancy, nursing, or trying to conceive is a hard stop for every vial on this catalog.";
    return {
      blocked: true,
      blockReason: reason,
      title: "Supplements only",
      summary: reason,
      peptides: [],
      supplements: supplementsFor(profile, []),
      holdWhen: "Do not start a peptide worksheet.",
      notes: [
        "The supplement list is still educational, not a prescription.",
        "Speak to a clinician if this is a medical situation.",
      ],
    };
  }

  const cap = MAX_PEPTIDES[profile.risk];
  const peptides: PeptideRec[] = [];
  const notes: string[] = [];

  if (profile.flags.includes("cancer")) {
    notes.push(
      "Cancer history: GH-axis and aggressive metabolic sheets are omitted. Recovery and skin worksheets stay at the conservative amount if they appear.",
    );
  }
  if (profile.flags.includes("cardio")) {
    notes.push(
      "Cardiovascular flag: PT-141 and GLP-1 sheets are omitted. If a heart-rate strap is connected, treat a rising resting HR as a reason to stop, not to add water.",
    );
  }
  if (profile.experience === "none" && profile.risk === "aggressive") {
    notes.push(
      "You marked no reconstitution experience and aggressive risk. The matcher still honours aggressive, but read the reconstitution guide before the first vial.",
    );
  }

  const goalOrder = profile.goals;
  for (const goal of goalOrder) {
    if (peptides.length >= cap) break;
    const options = candidatesFor(goal)
      .filter((candidate) => allowed(candidate.minRisk, profile.risk))
      .reverse();

    for (const candidate of options) {
      if (peptides.length >= cap) break;
      if (profile.flags.includes("cancer") && ["tesamorelin", "cjc-1295", "ipamorelin", "tirzepatide", "retatrutide", "nad-plus"].includes(candidate.slug)) {
        continue;
      }
      if (profile.flags.includes("cardio") && ["pt-141", "tirzepatide", "retatrutide"].includes(candidate.slug)) {
        continue;
      }
      if (covers(peptides, candidate.slug) || conflicts(peptides, candidate.slug)) continue;
      const rec = toRec(candidate, profile.flags.includes("cancer") ? "conservative" : profile.risk);
      if (rec) peptides.push(rec);
    }
  }

  if (peptides.length === 0) {
    notes.push("No peptide on this catalog fits that goal and risk pair. The supplement list is the whole plan.");
  }

  const names = peptides.map((item) => item.name).join(", ");
  const title = peptides.length
    ? `${riskLevelsLabel(profile.risk)} · ${names}`
    : `${riskLevelsLabel(profile.risk)} · supplements`;

  return {
    blocked: false,
    title,
    summary: summarize(profile, peptides),
    peptides,
    supplements: supplementsFor(profile, peptides),
    holdWhen:
      "If a connected strap shows a hard recovery day, skip extra pulses and extra stacks. Do not make it up the next morning.",
    notes,
  };
}

function riskLevelsLabel(risk: RiskLevel): string {
  return risk[0].toUpperCase() + risk.slice(1);
}

function summarize(profile: PlanProfile, peptides: PeptideRec[]): string {
  const goalLabels = profile.goals.join(", ");
  if (peptides.length === 0) {
    return `Goals: ${goalLabels}. Risk band ${profile.risk} did not unlock a vial. Stay on the supplement list.`;
  }
  return `Goals: ${goalLabels}. ${peptides.length} worksheet${peptides.length === 1 ? "" : "s"} at the ${profile.risk} band, with reconstitution math from the catalog vial sizes.`;
}

export function reconFor(rec: PeptideRec) {
  return calculateRecon({
    vialMg: rec.vialMg,
    waterMl: rec.waterMl,
    doseMcg: rec.doseMcg,
  });
}
