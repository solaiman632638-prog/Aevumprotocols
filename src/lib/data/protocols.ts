import { categories, type Protocol } from "@/lib/types";
import { applyPepipedia } from "@/lib/data/pepipedia";

const fixtures: Protocol[] = [
  {
    slug: "bpc-157",
    name: "BPC-157",
    synonyms: ["Body protection compound-157", "PL 14736"],
    category: "healing-recovery",
    summary:
      "A pentadecapeptide fragment studied for tissue repair. This worksheet reconstitutes a 10 mg vial and uses the daily amounts most often cited in preclinical work.",
    vialMg: 10,
    typicalWaterMl: 2,
    doseMcg: 250,
    route: "Subcutaneous",
    form: "lyophilized",
    reconstitution:
      "Add 2 mL bacteriostatic water down the glass wall. Swirl until the cake is gone. That yields 5 mg/mL, or 50 mcg per insulin unit.",
    schedule: "Once daily, same time each day. Split morning/evening if the daily amount is above 500 mcg.",
    cycle: "2–6 weeks of daily use, then a pause at least as long as the run.",
    doses: [
      { label: "Common research range", amount: "250 mcg", frequency: "Once daily", notes: "5 units from a 2 mL reconstitution" },
      { label: "Upper cited range", amount: "500 mcg", frequency: "Once daily or split", notes: "10 units from a 2 mL reconstitution" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C, protected from light",
    storageReconstituted: "2–8 °C, use within 28 days",
    notes: [
      "Do not shake the vial. Rolling between the palms is enough.",
      "If the solution clouds or particles remain after swirling, discard it.",
      "This is a reconstitution worksheet, not a treatment plan.",
    ],
    related: ["tb-500", "wolverine-stack", "kpv"],
  },
  {
    slug: "tb-500",
    name: "TB-500",
    synonyms: ["Thymosin beta-4 fragment", "Ac-LKKTETQ"],
    category: "healing-recovery",
    summary:
      "A synthetic fragment of thymosin beta-4 used in recovery research. Loading is typically twice weekly, then a thinner weekly hold.",
    vialMg: 10,
    typicalWaterMl: 2,
    doseMcg: 2000,
    route: "Subcutaneous",
    form: "lyophilized",
    reconstitution:
      "2 mL bacteriostatic water into a 10 mg vial gives 5 mg/mL. A 2 mg draw is 40 units on a U-100 syringe.",
    schedule: "Twice weekly for 4 weeks (loading), then once weekly.",
    cycle: "4-week load, 4–6 week maintenance, then stop and reassess.",
    doses: [
      { label: "Loading", amount: "2.0–2.5 mg", frequency: "Twice weekly", notes: "40–50 units from a 2 mL reconstitution" },
      { label: "Maintenance", amount: "2.0 mg", frequency: "Once weekly", notes: "40 units" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 28 days",
    notes: [
      "Amounts are milligrams, not micrograms — a 2 mg draw is eight times a 250 mcg BPC-157 draw.",
      "Often paired with BPC-157 rather than run alone. See Wolverine Stack if both are in one vial.",
    ],
    related: ["bpc-157", "wolverine-stack"],
  },
  {
    slug: "wolverine-stack",
    name: "Wolverine Stack",
    synonyms: ["BPC-157 + TB-500"],
    category: "healing-recovery",
    summary:
      "One 10 mg vial filled 5 mg BPC-157 and 5 mg TB-500. The worksheet treats the vial as a single solution; each millilitre contains both peptides.",
    vialMg: 10,
    vialLabel: "5 mg + 5 mg",
    typicalWaterMl: 2,
    doseMcg: 500,
    route: "Subcutaneous",
    form: "blend",
    reconstitution:
      "2 mL bacteriostatic water yields 5 mg/mL total peptide (2.5 mg/mL of each). A 0.1 mL (10 unit) draw is 250 mcg of each.",
    schedule: "Once daily during a recovery block.",
    cycle: "4–6 weeks, then stop.",
    doses: [
      { label: "Daily research draw", amount: "250 mcg each", frequency: "Once daily", notes: "10 units from a 2 mL reconstitution" },
      { label: "Higher daily draw", amount: "500 mcg each", frequency: "Once daily", notes: "20 units" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 28 days",
    notes: [
      "You cannot dose the two peptides independently from this vial.",
      "If you need a TB-500-heavy load, use separate vials and the single-compound worksheets.",
    ],
    related: ["bpc-157", "tb-500", "klow"],
  },
  {
    slug: "kpv",
    name: "KPV",
    synonyms: ["α-MSH 11-13"],
    category: "healing-recovery",
    summary:
      "A tripeptide C-terminal fragment of α-MSH studied for inflammatory signalling. Typical research amounts are in the low hundreds of micrograms.",
    vialMg: 10,
    typicalWaterMl: 2,
    doseMcg: 250,
    route: "Subcutaneous",
    form: "lyophilized",
    reconstitution:
      "2 mL bacteriostatic water into 10 mg gives 5 mg/mL, 50 mcg/unit. A 250 mcg amount is 5 units.",
    schedule: "Once daily.",
    cycle: "2–4 weeks.",
    doses: [
      { label: "Common range", amount: "200–250 mcg", frequency: "Once daily" },
      { label: "Upper cited range", amount: "500 mcg", frequency: "Once daily" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 28 days",
    notes: [
      "Also a component of KLOW. Do not stack a full KPV vial on top of KLOW without accounting for the overlap.",
    ],
    related: ["klow", "bpc-157"],
  },
  {
    slug: "thymosin-alpha-1",
    name: "Thymosin Alpha-1",
    synonyms: ["Tα1", "Thymalfasin"],
    category: "healing-recovery",
    summary:
      "A 28-residue thymic peptide used in immune-modulation research. Worksheets usually run twice weekly rather than daily.",
    vialMg: 10,
    typicalWaterMl: 2,
    doseMcg: 1600,
    route: "Subcutaneous",
    form: "lyophilized",
    reconstitution:
      "2 mL bacteriostatic water yields 5 mg/mL. A 1.6 mg draw is 32 units.",
    schedule: "Twice weekly, at least 72 hours apart.",
    cycle: "4–8 weeks.",
    doses: [
      { label: "Common research amount", amount: "1.5–1.6 mg", frequency: "Twice weekly", notes: "30–32 units from a 2 mL reconstitution" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 28 days",
    notes: [
      "Do not confuse with TB-500 (thymosin beta-4 fragment). The two are different molecules and different amounts.",
    ],
    related: ["tb-500"],
  },
  {
    slug: "tesamorelin",
    name: "Tesamorelin",
    synonyms: ["GHRH analog"],
    category: "growth-hormone",
    summary:
      "A stabilized GHRH analog. Research protocols are daily, usually in the evening, at milligram rather than microgram amounts.",
    vialMg: 10,
    typicalWaterMl: 2,
    doseMcg: 1000,
    route: "Subcutaneous, abdomen",
    form: "lyophilized",
    reconstitution:
      "2 mL bacteriostatic water into 10 mg gives 5 mg/mL. A 1 mg amount is 20 units; 2 mg is 40 units.",
    schedule: "Once daily, evening, away from food if the protocol requires a fasted window.",
    cycle: "8–12 weeks, then reassess. Not typically pulsed like Ipamorelin.",
    doses: [
      { label: "Lower research amount", amount: "1 mg", frequency: "Once daily", notes: "20 units from a 2 mL reconstitution" },
      { label: "Common research amount", amount: "2 mg", frequency: "Once daily", notes: "40 units" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 14–28 days",
    notes: [
      "Sometimes paired with a secretagogue (Ipamorelin) rather than another GHRH analog.",
      "GHRH analogs are not interchangeable milligram-for-milligram with CJC-1295.",
    ],
    related: ["ipamorelin", "cjc-1295"],
  },
  {
    slug: "ipamorelin",
    name: "Ipamorelin",
    synonyms: ["GHRP analog"],
    category: "growth-hormone",
    summary:
      "A selective ghrelin-receptor secretagogue. Research amounts are in the low hundreds of micrograms, one to three times a day.",
    vialMg: 10,
    typicalWaterMl: 2,
    doseMcg: 200,
    route: "Subcutaneous",
    form: "lyophilized",
    reconstitution:
      "2 mL bacteriostatic water yields 5 mg/mL, 50 mcg/unit. A 200 mcg pulse is 4 units.",
    schedule: "1–3 pulses daily, often evening and/or morning, away from a carbohydrate-heavy meal.",
    cycle: "8–12 weeks.",
    doses: [
      { label: "Single pulse", amount: "200 mcg", frequency: "1–2× daily", notes: "4 units from a 2 mL reconstitution" },
      { label: "Upper pulse", amount: "300 mcg", frequency: "1–3× daily", notes: "6 units" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 28 days",
    notes: [
      "If you are using the CJC-1295 / Ipamorelin blend, use that worksheet instead of this one.",
    ],
    related: ["cjc-1295", "tesamorelin"],
  },
  {
    slug: "cjc-1295",
    name: "CJC-1295 / Ipamorelin Blend",
    synonyms: ["CJC/Ipa", "CJC-1295 no DAC + Ipamorelin"],
    category: "growth-hormone",
    summary:
      "5 mg CJC-1295 (no DAC) and 5 mg Ipamorelin in one vial. Each draw delivers both. This is not the DAC (long-acting) analog.",
    vialMg: 10,
    vialLabel: "5 mg + 5 mg",
    typicalWaterMl: 2,
    doseMcg: 200,
    route: "Subcutaneous",
    form: "blend",
    reconstitution:
      "2 mL bacteriostatic water yields 2.5 mg/mL of each peptide. A 100 mcg-of-each pulse is 4 units; 200 mcg of each is 8 units.",
    schedule: "1–2 pulses daily, often evening. No-DAC CJC is short-acting, so it is pulsed, not weekly.",
    cycle: "8–12 weeks.",
    doses: [
      { label: "Standard pulse", amount: "100 mcg each", frequency: "1–2× daily", notes: "4 units from a 2 mL reconstitution" },
      { label: "Higher pulse", amount: "200 mcg each", frequency: "1–2× daily", notes: "8 units" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 28 days",
    notes: [
      "You cannot change the CJC:Ipamorelin ratio from this vial.",
      "Do not also run a separate Ipamorelin vial on the same days unless you intend to raise only the secretagogue.",
    ],
    related: ["ipamorelin", "tesamorelin"],
  },
  {
    slug: "kisspeptin-10",
    name: "Kisspeptin-10",
    synonyms: ["Kp-10", "Metastin 45-54"],
    category: "growth-hormone",
    summary:
      "A decapeptide ligand of GPR54 used in reproductive-axis research. Amounts are pulsed, not taken as a daily replacement hormone.",
    vialMg: 10,
    typicalWaterMl: 2,
    doseMcg: 100,
    route: "Subcutaneous",
    form: "lyophilized",
    reconstitution:
      "2 mL bacteriostatic water into 10 mg gives 5 mg/mL, 50 mcg/unit. A 100 mcg pulse is 2 units.",
    schedule: "A few times per week, not necessarily daily.",
    cycle: "Short research blocks of 2–4 weeks.",
    doses: [
      { label: "Common pulse", amount: "100 mcg", frequency: "Several times weekly", notes: "2 units from a 2 mL reconstitution" },
      { label: "Upper cited pulse", amount: "200 mcg", frequency: "Several times weekly", notes: "4 units" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 14–28 days",
    notes: [
      "This worksheet is not a fertility protocol and does not replace endocrine care.",
    ],
    related: ["ipamorelin"],
  },
  {
    slug: "ghk-cu",
    name: "GHK-Cu",
    synonyms: ["Copper tripeptide-1"],
    category: "skin-hair-aesthetics",
    summary:
      "A copper-binding tripeptide studied for skin remodelling. Research use is subcutaneous or topical; this sheet is for the lyophilized vial.",
    vialMg: 50,
    typicalWaterMl: 5,
    doseMcg: 1500,
    route: "Subcutaneous or topical after reconstitution",
    form: "lyophilized",
    reconstitution:
      "5 mL bacteriostatic water into a 50 mg vial gives 10 mg/mL. A 1.5 mg amount is 15 units. A 100 mg vial at the same concentration needs 10 mL.",
    schedule: "Once daily or five days on, two off.",
    cycle: "4–8 weeks.",
    doses: [
      { label: "Common subcutaneous amount", amount: "1.0–2.0 mg", frequency: "Once daily", notes: "10–20 units at 10 mg/mL" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 28 days. Solution is blue-green; that is the copper complex, not contamination.",
    notes: [
      "KLOW already contains 50 mg GHK-Cu per 80 mg vial. Do not double it blindly.",
      "Discard if the blue colour is gone or the solution precipitates.",
    ],
    related: ["klow"],
  },
  {
    slug: "klow",
    name: "KLOW",
    synonyms: ["GHK-Cu + KPV + TB-500 + BPC-157"],
    category: "skin-hair-aesthetics",
    summary:
      "An 80 mg four-peptide fill: 50 mg GHK-Cu, 10 mg KPV, 10 mg TB-500, 10 mg BPC-157. Every draw contains all four in that ratio.",
    vialMg: 80,
    vialLabel: "80 mg blend",
    typicalWaterMl: 4,
    doseMcg: 2000,
    route: "Subcutaneous",
    form: "blend",
    reconstitution:
      "4 mL bacteriostatic water yields 20 mg/mL total. A 0.1 mL (10 unit) draw is 2 mg total peptide: 1.25 mg GHK-Cu and 0.25 mg of each of the other three.",
    schedule: "Once daily.",
    cycle: "4–6 weeks.",
    doses: [
      { label: "Daily research draw", amount: "2 mg total", frequency: "Once daily", notes: "10 units from a 4 mL reconstitution" },
      { label: "Smaller daily draw", amount: "1 mg total", frequency: "Once daily", notes: "5 units" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 28 days",
    notes: [
      "The certificate of analysis is the record of the actual fill. This worksheet uses the labelled split.",
      "Do not add extra BPC-157, TB-500, KPV, or GHK-Cu on top without subtracting what KLOW already contributes.",
    ],
    related: ["ghk-cu", "kpv", "bpc-157", "tb-500"],
  },
  {
    slug: "pt-141",
    name: "PT-141",
    synonyms: ["Bremelanotide"],
    category: "skin-hair-aesthetics",
    summary:
      "A melanocortin receptor agonist studied for sexual function. It is used as needed, not as a daily peptide.",
    vialMg: 10,
    typicalWaterMl: 2,
    doseMcg: 1000,
    route: "Subcutaneous",
    form: "lyophilized",
    reconstitution:
      "2 mL bacteriostatic water yields 5 mg/mL. A 1 mg amount is 20 units.",
    schedule: "As needed, not daily. Allow several hours of observation after a first small amount.",
    cycle: "Not a cycling compound. Limit frequency; do not treat it as a daily peptide.",
    doses: [
      { label: "First research amount", amount: "0.5–1.0 mg", frequency: "As needed", notes: "10–20 units from a 2 mL reconstitution" },
      { label: "Upper cited amount", amount: "1.5–2.0 mg", frequency: "As needed", notes: "30–40 units" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 28 days",
    notes: [
      "Flushing, nausea, and blood-pressure changes are commonly reported in the literature. Start at the low end.",
      "This is not a substitute for medical evaluation of sexual or cardiovascular symptoms.",
    ],
    related: [],
  },
  {
    slug: "retatrutide",
    name: "Retatrutide",
    synonyms: ["LY3437943", "triple agonist"],
    category: "glp-1-metabolic",
    summary:
      "A GIP/GLP-1/glucagon triple agonist. Research worksheets titrate weekly. This is a reconstitution and titration table, not a prescription.",
    vialMg: 10,
    typicalWaterMl: 2,
    doseMcg: 2500,
    route: "Subcutaneous, once weekly",
    form: "lyophilized",
    reconstitution:
      "2 mL bacteriostatic water into 10 mg gives 5 mg/mL. A 2.5 mg weekly amount is 50 units. A 30 mg vial at the same concentration takes 6 mL.",
    schedule: "Once weekly, same day, abdomen or thigh. Titrate slowly.",
    cycle: "Titration over months. Do not jump to a top-end amount in week one.",
    doses: [
      { label: "Start", amount: "2 mg", frequency: "Weekly", notes: "40 units at 5 mg/mL" },
      { label: "Step", amount: "4 mg", frequency: "Weekly", notes: "80 units — consider a more dilute reconstitution if the draw is awkward" },
      { label: "Later research amounts", amount: "8–12 mg", frequency: "Weekly", notes: "Reconstitute a larger vial, or a larger water volume, so the draw stays on the syringe" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 28 days",
    notes: [
      "Gastrointestinal effects scale with the size of the jump, not just the absolute amount.",
      "This compound is an investigational metabolic agonist. The worksheet does not diagnose, treat, or replace a clinician.",
    ],
    related: ["tirzepatide"],
  },
  {
    slug: "tirzepatide",
    name: "Tirzepatide",
    synonyms: ["LY3298176", "dual GIP/GLP-1 agonist"],
    category: "glp-1-metabolic",
    summary:
      "A dual GIP/GLP-1 receptor agonist. Research titration is weekly. Match water volume so the weekly draw stays readable on a U-100 syringe.",
    vialMg: 10,
    typicalWaterMl: 2,
    doseMcg: 2500,
    route: "Subcutaneous, once weekly",
    form: "lyophilized",
    reconstitution:
      "2 mL bacteriostatic water into 10 mg gives 5 mg/mL. 2.5 mg is 50 units; 5 mg is 100 units (1 mL).",
    schedule: "Once weekly. Stay at each step long enough to see tolerability before moving.",
    cycle: "Stepwise titration. There is no short 'cycle' in the recovery-peptide sense.",
    doses: [
      { label: "Start", amount: "2.5 mg", frequency: "Weekly", notes: "50 units at 5 mg/mL" },
      { label: "Step", amount: "5 mg", frequency: "Weekly", notes: "100 units — full 1 mL at this reconstitution" },
      { label: "Later research amounts", amount: "7.5–15 mg", frequency: "Weekly", notes: "Use more water or a larger vial so the draw is not past 1 mL" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 28 days",
    notes: [
      "If a weekly amount needs more than 1 mL, increase the water in the vial rather than stacking syringes.",
      "Not a substitute for licensed metabolic care.",
    ],
    related: ["retatrutide"],
  },
  {
    slug: "nad-plus",
    name: "NAD+",
    synonyms: ["Nicotinamide adenine dinucleotide"],
    category: "longevity-cellular",
    summary:
      "The oxidized cofactor, not a peptide, but reconstituted the same way from a lyophilized vial. Research subcutaneous amounts are tens to low hundreds of milligrams.",
    vialMg: 500,
    typicalWaterMl: 5,
    doseMcg: 50000,
    route: "Subcutaneous (slow) or as specified by the protocol under study",
    form: "lyophilized",
    reconstitution:
      "5 mL bacteriostatic water into 500 mg gives 100 mg/mL. A 50 mg amount is 50 units (0.5 mL). A 1000 mg vial at the same concentration takes 10 mL.",
    schedule: "1–3 times weekly in many research worksheets; some run smaller daily amounts.",
    cycle: "4–8 weeks.",
    doses: [
      { label: "Common subcutaneous amount", amount: "50 mg", frequency: "1–3× weekly", notes: "50 units at 100 mg/mL" },
      { label: "Upper cited amount", amount: "100 mg", frequency: "1–2× weekly", notes: "100 units" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C, protected from light",
    storageReconstituted: "2–8 °C, protected from light, use within 14–28 days",
    notes: [
      "Subcutaneous NAD+ can sting. A slower push and a more dilute reconstitution are the usual adjustments.",
      "This is not IV clinic protocol and does not describe infusion.",
    ],
    related: ["mots-c"],
  },
  {
    slug: "mots-c",
    name: "MOTS-c",
    synonyms: ["Mitochondrial ORF of the 12S rRNA type-c"],
    category: "longevity-cellular",
    summary:
      "A 16-residue mitochondrial-derived peptide studied for metabolic stress responses. Typical research use is a few times per week, not daily.",
    vialMg: 10,
    typicalWaterMl: 2,
    doseMcg: 5000,
    route: "Subcutaneous",
    form: "lyophilized",
    reconstitution:
      "2 mL bacteriostatic water yields 5 mg/mL. A 5 mg amount is 100 units (1 mL). Prefer 2 mL water so a 10 mg amount is not two syringes.",
    schedule: "2–3 times weekly.",
    cycle: "4 weeks on, then a pause.",
    doses: [
      { label: "Common research amount", amount: "5 mg", frequency: "2–3× weekly", notes: "100 units at 5 mg/mL" },
      { label: "Upper cited amount", amount: "10 mg", frequency: "2× weekly", notes: "Reconstitute with 4 mL if you want 10 mg to equal 1 mL" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 28 days",
    notes: [
      "Filed here under cellular health, not GLP-1. It is not an incretin analog.",
    ],
    related: ["nad-plus"],
  },
  {
    slug: "glutathione",
    name: "Glutathione",
    synonyms: ["GSH", "L-glutathione"],
    category: "longevity-cellular",
    summary:
      "A tripeptide thiol used in redox research. Reconstitute immediately before a session if the protocol calls for fresh solution.",
    vialMg: 1500,
    typicalWaterMl: 5,
    doseMcg: 200000,
    route: "Subcutaneous or as specified by the protocol under study",
    form: "lyophilized",
    reconstitution:
      "The catalog fill is 1500 mg. 5 mL bacteriostatic water yields 300 mg/mL. A 200 mg amount is 0.67 mL (67 units); 600 mg is 2 mL.",
    schedule: "Several times weekly in many worksheets.",
    cycle: "4–8 weeks.",
    doses: [
      { label: "Lower research amount", amount: "200 mg", frequency: "Several times weekly", notes: "67 units at 300 mg/mL" },
      { label: "Upper cited amount", amount: "600 mg", frequency: "Several times weekly", notes: "200 units — use more water if you need the draw under 1 mL" },
    ],
    storageLyophilized: "−20 °C, protected from light",
    storageReconstituted: "Use promptly; thiols oxidize. Do not keep reconstituted GSH for weeks the way you would BPC-157.",
    notes: [
      "The gamma-glutamyl bond is not a standard alpha-peptide sequence. Do not write it as ECG.",
      "Discoloration after reconstitution means the thiol has oxidized — discard.",
    ],
    related: ["nad-plus"],
  },
  {
    slug: "semax",
    name: "Semax",
    synonyms: ["ACTH 4-10 analog"],
    category: "brain-cognitive",
    summary:
      "A heptapeptide ACTH analog used in cognitive research. NovaEvum lists an atomizer presentation; this sheet covers both reconstitution and nasal use.",
    vialMg: 10,
    typicalWaterMl: 2,
    doseMcg: 300,
    route: "Intranasal",
    form: "intranasal",
    reconstitution:
      "If reconstituting a lyophilized 10 mg vial for a spray: 2 mL bacteriostatic water or sterile saline gives 5 mg/mL. A 300 mcg amount is 0.06 mL.",
    schedule: "Once or twice daily on working days, not necessarily at night.",
    cycle: "2–4 weeks on, 1–2 weeks off.",
    doses: [
      { label: "Common nasal range", amount: "200–300 mcg", frequency: "1–2× daily" },
      { label: "Upper cited range", amount: "600 mcg", frequency: "Split across the day" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 14–28 days. Keep the atomizer clean and upright.",
    notes: [
      "Nasal peptides are not interchangeable with subcutaneous reconstitution math if the spray delivers a fixed volume per actuation — count actuations, then check concentration.",
    ],
    related: ["selank"],
  },
  {
    slug: "selank",
    name: "Selank",
    synonyms: ["Tuftsin analog"],
    category: "brain-cognitive",
    summary:
      "A tuftsin-derived heptapeptide studied for anxiolytic and nootropic effects. Usually nasal, often paired with Semax rather than stacked subcutaneously.",
    vialMg: 10,
    typicalWaterMl: 2,
    doseMcg: 300,
    route: "Intranasal",
    form: "intranasal",
    reconstitution:
      "2 mL into 10 mg gives 5 mg/mL. Match the spray's microlitres per actuation to this concentration before counting sprays as 'a dose'.",
    schedule: "1–2 times daily.",
    cycle: "2–4 weeks.",
    doses: [
      { label: "Common nasal range", amount: "250–500 mcg", frequency: "1–2× daily" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 14–28 days",
    notes: [
      "Semax and Selank are often alternated or used in the same block; they are not substitutes for each other.",
    ],
    related: ["semax", "dsip"],
  },
  {
    slug: "dsip",
    name: "DSIP",
    synonyms: ["Delta sleep-inducing peptide"],
    category: "brain-cognitive",
    summary:
      "A nonapeptide studied in sleep research. Amounts are small and usually evening-only.",
    vialMg: 10,
    typicalWaterMl: 2,
    doseMcg: 100,
    route: "Subcutaneous",
    form: "lyophilized",
    reconstitution:
      "2 mL bacteriostatic water yields 5 mg/mL, 50 mcg/unit. A 100 mcg evening amount is 2 units — easy to overshoot. Use a finer syringe if you have one.",
    schedule: "Evening, 30–60 minutes before intended sleep.",
    cycle: "1–2 weeks to assess, not an indefinite nightly peptide.",
    doses: [
      { label: "Common research amount", amount: "100 mcg", frequency: "Evening", notes: "2 units from a 2 mL reconstitution" },
      { label: "Upper cited amount", amount: "300 mcg", frequency: "Evening", notes: "6 units" },
    ],
    storageLyophilized: "Refrigerated, 2–8 °C",
    storageReconstituted: "2–8 °C, use within 28 days",
    notes: [
      "Two units is a small draw. If 2 mL makes the amount unreadable, use 1 mL water instead (100 mcg = 1 unit at 10 mg/mL) only if you can measure 1 unit accurately.",
    ],
    related: ["selank"],
  },
];

export const stacks = [
  {
    slug: "wolverine",
    name: "Wolverine",
    compounds: ["bpc-157", "tb-500"],
    intent: "Recovery block using both tissue-repair peptides, either as separate vials or the 5 mg + 5 mg fill.",
    schedule:
      "If separate: BPC-157 daily at 250–500 mcg, TB-500 2 mg twice weekly for 4 weeks then weekly. If blended: one daily draw from the Wolverine worksheet.",
    notes: [
      "Do not run the blend vial and extra BPC-157 or TB-500 without subtracting the overlap.",
    ],
  },
  {
    slug: "klow-aesthetic",
    name: "KLOW",
    compounds: ["klow"],
    intent: "Single-vial skin and recovery blend. Four peptides, one ratio, one daily draw.",
    schedule: "Reconstitute the 80 mg vial with 4 mL and use the KLOW worksheet. Four to six weeks, then stop.",
    notes: [
      "Adding GHK-Cu, KPV, BPC-157, or TB-500 on the same days doubles those components.",
    ],
  },
  {
    slug: "ghrh-ghrp",
    name: "GHRH + secretagogue",
    compounds: ["cjc-1295", "ipamorelin", "tesamorelin"],
    intent: "Evening growth-hormone axis work. Prefer the CJC/Ipa blend, or Tesamorelin plus a separate Ipamorelin pulse — not all three.",
    schedule:
      "Blend: 100–200 mcg of each, 1–2× daily. Tesamorelin path: 1–2 mg Tesamorelin evening plus 200 mcg Ipamorelin if used.",
    notes: [
      "Two GHRH analogs at once (Tesamorelin and CJC) is not this stack.",
    ],
  },
  {
    slug: "nasal-pair",
    name: "Semax + Selank",
    compounds: ["semax", "selank"],
    intent: "Daytime cognitive pair, nasal, short blocks.",
    schedule: "Semax morning, Selank late afternoon or both split. Two to four weeks, then a week off.",
    notes: [
      "Count spray actuations against concentration. Do not assume one spray equals 300 mcg.",
    ],
  },
] as const;

export const protocols: Protocol[] = fixtures.map(applyPepipedia);

const bySlug = new Map(protocols.map((protocol) => [protocol.slug, protocol]));

export function getProtocol(slug: string): Protocol | undefined {
  return bySlug.get(slug);
}

export function protocolsByCategory(slug: string): Protocol[] {
  return protocols.filter((protocol) => protocol.category === slug);
}

export function categoryName(slug: string): string {
  return categories.find((category) => category.slug === slug)?.name ?? slug;
}

export const storeHome = "https://www.novaevum.ca";

/** NovaEvum product page. Store slugs match worksheet slugs one-to-one. */
export function storeUrl(slug: string): string {
  return `${storeHome}/shop/${slug}`;
}
