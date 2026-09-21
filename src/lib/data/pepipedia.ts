import type { Protocol } from "@/lib/types";

/** Pepipedia reconstitution guide, paraphrased. */
export const pepipediaStorage = {
  lyophilized:
    "−20 °C freezer preferred; a refrigerator is also acceptable. Do not open a cold vial — wait 15–30 minutes so it does not sweat. Avoid freeze–thaw cycling.",
  reconstituted:
    "2–8 °C, dark, up to 45 days when mixed with bacteriostatic water. Mixed vials stay in their box. Sterile water (no preservative) is single-use.",
  bacWater:
    "Bacteriostatic water: 20–25 °C. Do not refrigerate the diluent.",
  nasal:
    "2–8 °C before and after opening. Up to 45 days after first use. Do not freeze. Return the spray to the fridge after each actuation.",
};

type Overlay = Partial<
  Pick<
    Protocol,
    | "synonyms"
    | "summary"
    | "pepipediaSlug"
    | "sourceUrl"
    | "primaryUse"
    | "mechanism"
    | "safety"
    | "legal"
    | "approval"
    | "evidence"
    | "effects"
    | "researchScore"
    | "sideEffects"
    | "storageLyophilized"
    | "storageReconstituted"
  >
>;

function src(slug: string): string {
  return `https://www.pepipedia.com/peptides/${slug}`;
}

export const pepipedia: Record<string, Overlay> = {
  "bpc-157": {
    pepipediaSlug: "bpc-157",
    sourceUrl: src("bpc-157"),
    synonyms: ["Bepecin", "PL 14736", "PL-10", "Pentadecapeptide BPC 157"],
    primaryUse: "Tissue healing and gastrointestinal repair",
    researchScore: 60,
    effects: ["Healing", "Anti-inflammatory", "Gut health", "Joint support", "Wound healing"],
    legal: "Unapproved new drug (FDA Category 2 bulk). Prohibited by WADA.",
    approval: "Not FDA-approved for human or animal use.",
    evidence: "Limited human studies. Most evidence is preclinical.",
    summary:
      "A synthetic pentadecapeptide taken from a protective protein in gastric juice. Animal work points to angiogenesis, collagen, and gut-mucosa repair. Pepipedia scores the literature at 60/100 and flags the absence of controlled human trials.",
    mechanism:
      "VEGF-linked vessel growth, growth-hormone receptor expression, collagen formation, and the FAK–paxillin migration pathway. It also talks to the nitric oxide system and down-shifts pro-inflammatory cytokines.",
    safety:
      "No reported toxicity in animal models. Human long-term safety is unknown. Theoretical concern: VEGFR2 activation could support tumour growth.",
    sideEffects: ["Injection-site pain", "Swelling", "Infection", "Allergic reaction"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
  "tb-500": {
    pepipediaSlug: "tb-500",
    sourceUrl: src("tb-500"),
    synonyms: ["Tβ4 fragment", "T-beta-4", "Ac-SDKP"],
    primaryUse: "Tissue repair and cardiovascular protection",
    researchScore: 60,
    effects: ["Healing", "Angiogenesis", "Anti-inflammatory", "Wound healing"],
    legal: "Research chemical. WADA banned.",
    approval: "Research chemical only. Full-length thymosin beta-4 is in trials; the TB-500 fragment is not.",
    evidence: "Full-length Tβ4 has trials. The sold fragment has none.",
    summary:
      "A synthetic fragment of thymosin beta-4 (often residues 17–23), sold separately from the full-length protein that is actually in wound-healing and cardiac trials. Pepipedia treats TB-500 as a research chemical with no formal human safety file.",
    mechanism:
      "G-actin sequestration and cell migration, plus VEGF/bFGF. The Ac-SDKP fragment is the piece tied to TGF-β and fibrosis in cardiac models.",
    safety:
      "Full-length Tβ4 looks safe in trials. TB-500’s human safety is unknown. Theoretical cancer risk. WADA prohibited.",
    sideEffects: ["Joint pain", "Headache", "Fatigue", "Temporary local hair growth"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
  "wolverine-stack": {
    pepipediaSlug: "bpc-157",
    sourceUrl: src("bpc-157"),
    primaryUse: "Combined tissue-repair worksheets (BPC-157 + TB-500)",
    researchScore: 60,
    effects: ["Healing", "Anti-inflammatory", "Wound healing"],
    legal: "Neither component is FDA-approved. BPC-157 is an unapproved new drug and WADA-prohibited; TB-500 is a research chemical.",
    approval: "Not a Pepipedia monograph. Sourced from the BPC-157 and TB-500 entries.",
    evidence: "See the two singles. The blend has no separate literature.",
    summary:
      "NovaEvum’s 5 mg + 5 mg fill. Pepipedia has no Wolverine page; science is the BPC-157 gastric-juice fragment plus the thymosin-beta-4 fragment. Both are research chemicals with thin human data.",
    mechanism:
      "BPC-157: VEGF, NO, collagen. TB-500: actin/cell migration and angiogenesis. You cannot change the ratio from this vial.",
    safety:
      "Same caveats as the singles: no controlled human file for either fragment, theoretical angiogenic/tumour concern, WADA issues.",
    sideEffects: ["Injection-site reactions", "Headache", "Fatigue"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
  kpv: {
    pepipediaSlug: "kpv",
    sourceUrl: src("kpv"),
    synonyms: ["α-MSH 11-13", "Ac-Lys-Pro-Val"],
    primaryUse: "Anti-inflammatory peptide for skin and gut models",
    researchScore: 60,
    effects: ["Anti-inflammatory", "Skin health", "Wound healing"],
    legal: "Research chemical.",
    approval: "Research chemical only.",
    evidence: "Preclinical work and limited topical/oral experimental use.",
    summary:
      "The C-terminal tripeptide of α-MSH (lysine-proline-valine). Pepipedia files it under skin: anti-inflammatory and antimicrobial models (colitis, psoriasis, wounds) without steroid-style immunosuppression.",
    mechanism:
      "Melanocortin-receptor-independent. Cuts IL-1β, TNF-α, IL-6 and damps NF-κB in keratinocytes and immune cells.",
    safety:
      "Mild topical irritation and mild GI upset when taken orally in the available reports. No long-term human file.",
    sideEffects: ["Mild skin irritation (topical)", "Mild GI upset (oral)"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
  "thymosin-alpha-1": {
    pepipediaSlug: "thymosin-alpha-1",
    sourceUrl: src("thymosin-alpha-1"),
    synonyms: ["Zadaxin", "Thymalfasin", "TA1", "Tα1"],
    primaryUse: "Immune modulation; viral infection protocols outside the US",
    researchScore: 90,
    effects: ["Immune", "Antiviral", "Anti-inflammatory"],
    legal: "Prescription in some countries. Not a US FDA approval for the indications discussed.",
    approval: "Approved in many countries for hepatitis B/C and as a vaccine adjuvant; not a US catch-all.",
    evidence: "Large trial safety file. Recent interest in COVID/PASC and oncology adjuvants.",
    summary:
      "A 28-residue thymic peptide (thymalfasin / Zadaxin). Pepipedia rates the literature 90/100: an immunomodulator used outside the US for viral hepatitis and as an adjuvant, with a generally quiet adverse-event profile.",
    mechanism:
      "T-cell maturation via TLR2/TLR9, Th1 cytokines (IL-2, IFN-γ, IL-12), MHC I, dendritic-cell maturation, NK activity.",
    safety:
      "Adverse events are rare and usually local. Large trials have not shown significant drug-related toxicity.",
    sideEffects: ["Injection-site reactions", "Mild fatigue", "Short flu-like symptoms"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
  tesamorelin: {
    pepipediaSlug: "tesamorelin",
    sourceUrl: src("tesamorelin"),
    synonyms: ["TH9507", "Egrifta", "trans-3-hexenoyl-GHRH(1-44)-NH2"],
    primaryUse: "FDA-approved reduction of HIV-associated visceral fat (Egrifta)",
    researchScore: 90,
    effects: ["Visceral fat reduction", "GH release", "Metabolic"],
    legal: "Prescription only.",
    approval: "FDA-approved as Egrifta for HIV-associated lipodystrophy.",
    evidence: "FDA-approved product with a labelled indication.",
    summary:
      "A GHRH analog. Pepipedia’s page is the approved drug Egrifta: it stimulates pituitary GH to reduce visceral adipose tissue in HIV-associated lipodystrophy. That is not a general fat-loss licence.",
    mechanism:
      "GHRH-receptor binding on somatotrophs, GH then IGF-1, with relatively visceral lipolysis in the labelled population.",
    safety:
      "Injection-site reactions, hypersensitivity, glucose intolerance/diabetes risk, IGF-1 rise (cancer monitoring on the label).",
    sideEffects: ["Injection-site reactions", "Joint pain", "Muscle pain", "Numbness", "Nausea", "Sleep change"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
  ipamorelin: {
    pepipediaSlug: "ipamorelin",
    sourceUrl: src("ipamorelin"),
    synonyms: ["NNC-26-0161", "Aib-His-D-2-Nal-D-Phe-Lys-NH2"],
    primaryUse: "Selective ghrelin-receptor GH secretagogue (research)",
    researchScore: 45,
    effects: ["GH release", "Recovery", "Sleep"],
    legal: "Research chemical. 2024 FDA compounding re-evaluation is not approval.",
    approval: "Not FDA-approved. Postoperative-ileus Phase II was stopped for lack of efficacy.",
    evidence: "No active trials. Earlier Phase II discontinued.",
    summary:
      "A pentapeptide ghrelin-receptor agonist that pulses GH more selectively than older GHRPs. Pepipedia’s literature score is 45/100: development for ileus failed, and 2020–2025 clinical work is essentially absent.",
    mechanism:
      "GHS-R (ghrelin receptor) on the anterior pituitary, calcium mobilisation, GH pulse — without the ACTH/cortisol/prolactin bump typical of older secretagogues.",
    safety:
      "Short studies tolerated it. Long-term human safety is unknown.",
    sideEffects: ["Injection-site reactions", "Water retention", "Headache", "Numbness", "Joint pain", "Fatigue"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
  "cjc-1295": {
    pepipediaSlug: "cjc-1295",
    sourceUrl: src("cjc-1295"),
    synonyms: ["Modified GRF 1-29", "Mod GRF 1-29", "CJC-1295 no DAC", "CJC-1295 DAC"],
    primaryUse: "GHRH analog for GH/IGF-1 research",
    researchScore: 40,
    effects: ["GH release", "Recovery", "Sleep"],
    legal: "Research chemical. WADA prohibited. 2024 compounding review is not approval.",
    approval: "Not FDA-approved. No recent trials that led to a licence.",
    evidence: "Early-phase work before 2020. Nothing that became a product.",
    summary:
      "A GHRH analog sold with or without DAC. Pepipedia’s page covers both: DAC albumin-binding stretches half-life to days; no-DAC (Mod GRF 1-29) stays a pulse. NovaEvum’s vial is the no-DAC + Ipamorelin blend. Literature score 40/100. FDA has flagged cardiac-event risk in this class.",
    mechanism:
      "GHRH-receptor drive of pituitary GH. DAC (maleimidopropionic acid) binds albumin (~6–8 day half-life). The catalog blend is the short analog plus Ipamorelin, not weekly DAC.",
    safety:
      "Long-term human safety unknown. FDA notes cardiac-event risk. GH/IGF-1 elevation can mean water retention and insulin resistance.",
    sideEffects: ["Injection-site reactions", "Numbness", "Water retention", "Headache", "Joint stiffness", "Insulin resistance"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
  "kisspeptin-10": {
    pepipediaSlug: "kisspeptin-10",
    sourceUrl: src("kisspeptin-10"),
    synonyms: ["KISS1 45-54", "Metastin 45-54", "KP-10"],
    primaryUse: "GnRH-axis research; fertility and HSDD studies",
    researchScore: 75,
    effects: ["GnRH/LH/FSH pulse", "Reproductive axis"],
    legal: "Research chemical. Some human experimental work.",
    approval: "Phase 2 territory, not an approved fertility drug on this page.",
    evidence: "Human studies in HSDD and fertility; generally well tolerated in those files.",
    summary:
      "A decapeptide ligand of GPR54 (KISS1R) on hypothalamic GnRH neurons. Pepipedia’s focus is HPG-axis regulation — LH/FSH downstream — plus anti-angiogenic/metastin history. Literature score 75/100.",
    mechanism:
      "GPR54 on GnRH neurons, Gq/11, calcium and PLC, then a GnRH pulse and pituitary LH/FSH.",
    safety:
      "Favourable in the human studies cited. Short half-life. Still not a fertility protocol.",
    sideEffects: ["Hormone fluctuation", "Injection-site reactions", "Headache", "Cycle timing change"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
  "ghk-cu": {
    pepipediaSlug: "ghk-cu",
    sourceUrl: src("ghk-cu"),
    synonyms: ["Copper tripeptide-1", "Glycyl-histidyl-lysine copper"],
    primaryUse: "Skin remodelling and wound healing (mostly topical literature)",
    researchScore: 85,
    effects: ["Collagen", "Wound healing", "Anti-inflammatory", "Hair models"],
    legal: "Research chemical / cosmetic use. Not a systemic drug approval.",
    approval: "Cosmetic use. Systemic injection is a different, thinner file.",
    evidence: "Extensive skin-remodelling and wound literature.",
    summary:
      "A copper-binding tripeptide isolated from plasma in 1973. Pepipedia’s 85/100 score is almost entirely topical: collagen, ECM, wound models. Injected use adds copper-load risk that the cream data do not cover.",
    mechanism:
      "Copper-dependent MMP/TIMP balance, collagen I/III/IV, elastin, fibroblast TGF-β/SMAD.",
    safety:
      "Topical: mild irritation. Systemic: copper toxicity (nausea, metallic taste, organ stress) if unsupervised. Avoid in Wilson’s disease and active cancer.",
    sideEffects: ["Skin irritation", "Redness", "Contact dermatitis"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted:
      `${pepipediaStorage.reconstituted} Solution is blue-green; that is the copper complex, not contamination.`,
  },
  klow: {
    pepipediaSlug: "ghk-cu",
    sourceUrl: src("ghk-cu"),
    primaryUse: "Four-peptide aesthetic/recovery blend (not a Pepipedia monograph)",
    researchScore: 60,
    effects: ["Skin", "Healing", "Anti-inflammatory"],
    legal: "Blend of four research chemicals. No single Pepipedia page.",
    approval: "Sourced from GHK-Cu, KPV, TB-500, and BPC-157 entries.",
    evidence: "See the four singles. The 80 mg fill has no independent trial.",
    summary:
      "NovaEvum 80 mg fill: 50 mg GHK-Cu, 10 mg KPV, 10 mg TB-500, 10 mg BPC-157. Pepipedia has no KLOW page. The science is those four monographs — copper-peptide skin work, α-MSH fragment inflammation, and two repair fragments.",
    mechanism:
      "GHK-Cu ECM/copper, KPV cytokine dampening, BPC-157 VEGF/NO, TB-500 actin migration — locked in one ratio.",
    safety:
      "Copper-load and angiogenic caveats from GHK-Cu and BPC-157/TB-500 still apply. Do not add the singles on the same days.",
    sideEffects: ["Injection-site reactions", "Skin irritation", "Headache"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
  "pt-141": {
    pepipediaSlug: "pt-141",
    sourceUrl: src("pt-141"),
    synonyms: ["Bremelanotide", "Vyleesi"],
    primaryUse: "FDA-approved HSDD in premenopausal women (Vyleesi)",
    researchScore: 90,
    effects: ["Sexual desire (labelled population)", "MC4R agonist"],
    legal: "FDA-approved prescription (Vyleesi) for a specific indication.",
    approval: "FDA-approved 2019 for premenopausal HSDD.",
    evidence: "Labelled melanocortin agonist with an approved indication.",
    summary:
      "Bremelanotide, a Melanotan II descendant. Pepipedia’s page is the approved drug Vyleesi: central MC4R, not a PDE5/blood-flow drug. Nausea is common (~40%). Contraindicated in uncontrolled hypertension/CVD.",
    mechanism:
      "MC4R in CNS pathways for sexual desire and arousal; dopaminergic and related cascades — not a local vasodilator.",
    safety:
      "Nausea very common. Flushing, headache, transient BP rise. Focal hyperpigmentation with frequent use. Do not use in uncontrolled hypertension or CVD.",
    sideEffects: ["Nausea", "Flushing", "Injection-site reactions", "Headache", "Vomiting", "Transient BP rise"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
  retatrutide: {
    pepipediaSlug: "retatrutide",
    sourceUrl: src("retatrutide"),
    synonyms: ["LY3437943", "GLP-1/GIP/glucagon triple agonist"],
    primaryUse: "Investigational obesity and type 2 diabetes (Phase 3)",
    researchScore: 90,
    effects: ["Appetite", "Glycaemic control", "Weight (trial data)"],
    legal: "Investigational. Not approved.",
    approval: "Phase 3 (TRIUMPH). Not FDA-approved.",
    evidence: "Phase 2 in NEJM; Phase 3 ongoing.",
    summary:
      "Lilly’s GLP-1 / GIP / glucagon triple agonist. Pepipedia rates it 90/100 on trial data, not on a licence. GI effects are dose-dependent. Transient heart-rate rise is in the file.",
    mechanism:
      "GLP-1: glucose-dependent insulin, less glucagon, satiety. GIP: insulin sensitivity. Glucagon receptor: energy expenditure. All three at once.",
    safety:
      "Incretin-like GI effects (nausea, diarrhoea). Transient heart-rate increase. Profile is still being written in Phase 3.",
    sideEffects: ["Nausea", "Vomiting", "Diarrhoea", "Decreased appetite", "Injection-site reactions"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
  tirzepatide: {
    pepipediaSlug: "tirzepatide",
    sourceUrl: src("tirzepatide"),
    synonyms: ["Mounjaro", "Zepbound", "LY3298176"],
    primaryUse: "FDA-approved T2D (2022) and chronic weight management (2023)",
    researchScore: 95,
    effects: ["Glycaemic control", "Weight (labelled products)"],
    legal: "Prescription only (Mounjaro / Zepbound).",
    approval: "FDA-approved 2022 diabetes, 2023 obesity.",
    evidence: "SURPASS HbA1c and weight data; obesity trials ~19–21% weight reduction.",
    summary:
      "First dual GIP/GLP-1 co-agonist. Pepipedia’s page is the approved drugs Mounjaro and Zepbound — not a research-chemical monograph. GI effects dominate tolerability.",
    mechanism:
      "GIP and GLP-1 receptors: insulin, glucagon suppression, slower gastric emptying, central intake regulation. Higher GIP than GLP-1 affinity on this molecule.",
    safety:
      "Generally tolerated. GI side effects are the common ones.",
    sideEffects: ["Nausea", "Diarrhoea", "Vomiting", "Constipation", "Abdominal pain"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
  "nad-plus": {
    pepipediaSlug: "nad-nmn-nr-complex",
    sourceUrl: src("nad-nmn-nr-complex"),
    synonyms: ["NAD+", "NMN", "NR", "Coenzyme I"],
    primaryUse: "Cellular NAD+ pool; ageing and metabolic research",
    researchScore: 85,
    effects: ["Mitochondrial function", "Sirtuins", "DNA repair (mechanistic)"],
    legal: "NR has GRAS as a supplement. Injectable NAD+ is not that oral file.",
    approval: "GRAS / dietary-supplement path for NR. Injectable NAD+ is a research chemical on this catalog.",
    evidence: "NMN/NR in trials for ageing, metabolic health, neurodegeneration.",
    summary:
      "Pepipedia groups NAD+ with its precursors NMN and NR. Oral NR is GRAS. The NovaEvum vial is the cofactor itself, not a capsule. Levels fall with age; the literature Pepipedia cites is mostly precursor supplementation, not subcutaneous NAD+ clinic protocols.",
    mechanism:
      "NMN/NR enter the salvage path to NAD+. NAD+ fuels redox metabolism and sirtuins (SIRT1/SIRT3). Direct NAD+ skips that oral conversion.",
    safety:
      "Oral precursors: mild GI, flushing. Short-term studies look quiet. Injectable sting and longer-term data are a different question.",
    sideEffects: ["Nausea", "Headache", "Flushing", "Sleep change", "Fatigue"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
  "mots-c": {
    pepipediaSlug: "mots-c",
    sourceUrl: src("mots-c"),
    synonyms: ["Mitochondrial ORF of the 12S rRNA type-c"],
    primaryUse: "Metabolic and exercise-mimetic research",
    researchScore: 60,
    effects: ["AMPK", "Metabolic homeostasis", "Exercise-mimetic models"],
    legal: "Research chemical. WADA prohibited at all times.",
    approval: "Research chemical only. No human licence.",
    evidence: "Broad preclinical 2020–2025 file; no clinical approval.",
    summary:
      "A 16-residue mitochondrial-derived peptide. Pepipedia places it on AMPK and nuclear gene expression during metabolic stress. Literature score 60/100, human safety unestablished, WADA banned at all times.",
    mechanism:
      "AMPK activation and nuclear translocation under metabolic stress to change gene expression. Framed as an exercise mimetic in rodent work.",
    safety:
      "Human safety unestablished. Theoretical hypoglycaemia and mitochondrial over-activation. Injection-site reactions. WADA prohibited.",
    sideEffects: ["Injection-site reactions", "Temporary fatigue", "Mild headache"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
  glutathione: {
    pepipediaSlug: "glutathione",
    sourceUrl: src("glutathione"),
    synonyms: ["GSH", "Reduced glutathione", "γ-L-glutamyl-L-cysteinyl-glycine"],
    primaryUse: "Endogenous antioxidant and detoxification tripeptide",
    researchScore: 85,
    effects: ["Antioxidant", "Immune", "Detoxification"],
    legal: "OTC in many oral/topical forms. Parenteral use is a different product class.",
    approval: "Multiple approved contexts exist for glutathione as a substance; this catalog vial is still a research fill.",
    evidence: "Extensive human literature as a molecule.",
    summary:
      "The body’s thiol tripeptide (glutamate–cysteine–glycine with a gamma-glutamyl bond). Pepipedia calls it the master antioxidant, score 85/100, safety ‘excellent’ at ordinary amounts. The gamma bond is why we do not write it as ECG.",
    mechanism:
      "GSH/GSSG redox cycle. The cysteine thiol scavenges radicals, recycles vitamins C and E, and feeds conjugation/detox paths.",
    safety:
      "Pepipedia: generally well tolerated at standard amounts. Reconstituted thiols still oxidise in the vial — colour change means discard.",
    sideEffects: ["Usually quiet at ordinary amounts"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted:
      "2–8 °C, dark. Use promptly once mixed — thiols oxidise even when the Pepipedia safety file for the molecule itself is excellent.",
  },
  semax: {
    pepipediaSlug: "semax",
    sourceUrl: src("semax"),
    synonyms: ["ACTH(4-7)Pro-Gly-Pro", "MEHFPGP"],
    primaryUse: "Nootropic / neuroprotective prescription in Russia; research chemical elsewhere",
    researchScore: 75,
    effects: ["BDNF", "Focus", "Neuroprotection (Russian labelled use)"],
    legal: "Research chemical in the US/EU. Prescription in Russia and some Eastern European states.",
    approval: "Approved in Russia; not FDA-approved.",
    evidence: "Limited human studies outside the Russian labelled use.",
    summary:
      "A heptapeptide ACTH fragment analog. Pepipedia: BDNF/TrkB, dopamine and serotonin, Russian clinical use as a nootropic/neuroprotective. In the US it is a research chemical. Score 75/100.",
    mechanism:
      "ACTH(4-10) analog with better stability and BBB entry. BDNF and TrkB, MAPK/ERK, serotonin and dopamine, glutamate regulation.",
    safety:
      "Mostly nasal irritation. May raise glucose in diabetes. Avoid in pregnancy. Long-term effects poorly described outside Russia.",
    sideEffects: ["Nasal irritation", "Congestion", "Headache", "Insomnia", "Anxiety", "Nausea", "Dizziness"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.nasal,
  },
  selank: {
    pepipediaSlug: "selank",
    sourceUrl: src("selank"),
    synonyms: ["Thr-Lys-Pro-Arg-Pro-Gly-Pro", "tuftsin analog"],
    primaryUse: "Anxiolytic/nootropic prescription in Russia; research chemical elsewhere",
    researchScore: 70,
    effects: ["Anxiolytic (Russian labelled use)", "BDNF", "GABAergic"],
    legal: "Research peptide outside Russia.",
    approval: "Approved in Russia for GAD/nootropic use; not FDA-approved.",
    evidence: "Russian labelled use. Long-term data outside Russia is thin.",
    summary:
      "A tuftsin-derived heptapeptide. Pepipedia: GABA, serotonin/dopamine, BDNF, enkephalinase. Russian anxiolytic/nootropic. Not a benzodiazepine and not a US drug.",
    mechanism:
      "Tuftsin analog plus stabilising residues. BDNF and serotonin expression, T-helper balance, GABA inhibitory tone, BBB penetration.",
    safety:
      "No typical sedative dependence in the Russian file. Rare headache, nasal/injection irritation, nausea, dizziness. Long-term safety outside Russia is limited.",
    sideEffects: ["Headache", "Nasal irritation", "Nausea", "Dizziness", "Fatigue"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.nasal,
  },
  dsip: {
    pepipediaSlug: "dsip",
    sourceUrl: src("dsip"),
    synonyms: ["Deltaran", "Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu"],
    primaryUse: "Sleep and stress research",
    researchScore: 60,
    effects: ["Sleep", "Stress", "Circadian models"],
    legal: "Research chemical. FDA warning on compounded immunogenicity.",
    approval: "Research chemical only.",
    evidence: "Clinical efficacy described as inconsistent.",
    summary:
      "A nine-residue peptide isolated in 1977 from sleeping rabbits. Pepipedia: GABA, adenosine, HPA/cortisol. Score 60/100, inconsistent clinical effect, and an FDA warning about antibody formation in compounded products.",
    mechanism:
      "Neuromodulator on GABAergic sleep regions, adenosine signalling, HPA-axis stress tone. Crosses the BBB in the models cited.",
    safety:
      "Long-term human safety unknown. Grogginess and headache in anecdotes. FDA: potential life-threatening immunogenicity with compounded DSIP. Sedative interactions.",
    sideEffects: ["Drowsiness", "Headache", "Injection-site reactions", "Appetite change"],
    storageLyophilized: pepipediaStorage.lyophilized,
    storageReconstituted: pepipediaStorage.reconstituted,
  },
};

export function applyPepipedia(protocol: Protocol): Protocol {
  const extra = pepipedia[protocol.slug];
  if (!extra) return protocol;
  return {
    ...protocol,
    ...extra,
    synonyms: extra.synonyms ?? protocol.synonyms,
    notes: [
      ...protocol.notes,
      pepipediaStorage.bacWater,
      "Pepipedia withholds investigational dosing on research-chemical monographs. Amounts on this sheet are reconstitution math for the NovaEvum vial, not a Pepipedia dose.",
    ],
  };
}
