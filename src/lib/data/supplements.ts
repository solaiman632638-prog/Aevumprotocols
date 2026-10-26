import type { ConditionId } from "@/lib/today/types";
import type { GoalId } from "@/lib/plan/types";

/**
 * The main over-the-counter supplements, written up by hand from the human
 * trials and the official upper limits (NIH ODS, Health Canada, EFSA, ISSN
 * position stands). Amounts are the ranges studied in healthy adults, not a
 * prescription. Weight-based amounts are worked out on the page from the
 * profile saved on this device.
 */

export const supplementGoals = [
  { slug: "testosterone", name: "Testosterone" },
  { slug: "muscle", name: "Muscle & strength" },
  { slug: "performance", name: "Endurance & pump" },
  { slug: "brain", name: "Brain & focus" },
  { slug: "stress", name: "Stress & mood" },
  { slug: "sleep", name: "Sleep" },
  { slug: "heart", name: "Heart & cholesterol" },
  { slug: "metabolic", name: "Fat loss & blood sugar" },
  { slug: "joints", name: "Joints, skin & hair" },
  { slug: "gut", name: "Gut" },
  { slug: "foundation", name: "Everyday basics" },
] as const;

export type SupplementGoal = (typeof supplementGoals)[number]["slug"];

/** Which supplement goals each Today profile goal points to. */
export const goalsFromProfile: Record<GoalId, SupplementGoal[]> = {
  recovery: ["muscle", "joints"],
  "fat-loss": ["metabolic"],
  muscle: ["muscle", "performance"],
  skin: ["joints"],
  sleep: ["sleep"],
  cognition: ["brain", "stress"],
  longevity: ["heart", "foundation"],
  libido: ["testosterone"],
};

/** How solid the human evidence is for the headline use. */
export type Evidence = "Strong" | "Good" | "Some" | "Early";

export const evidenceNotes: Record<Evidence, string> = {
  Strong: "Many controlled trials agree.",
  Good: "Several solid trials, mostly agreeing.",
  Some: "A handful of small trials; the effect is modest.",
  Early: "Small or early studies. Promising, not proven.",
};

/** Amount that scales with body weight; the page clamps it between min and max. */
export type PerKg = { low: number; high: number; unit: "g" | "mg"; min?: number; max?: number; label: string };

export type Supplement = {
  slug: string;
  name: string;
  aka?: string;
  goals: SupplementGoal[];
  evidence: Evidence;
  /** One line for the index card. */
  summary: string;
  whatItDoes: string;
  howItWorks: string;
  dose: {
    /** The studied range, written out. */
    amount: string;
    perKg?: PerKg;
    timing: string;
    form: string;
    /** How long before an effect, if there is one. */
    takesEffect: string;
    upperLimit?: string;
  };
  whoBenefits: string;
  sideEffects: string[];
  interactions: string[];
  /** Profile conditions that mean "talk to your clinician first", with why. */
  flags: Partial<Record<ConditionId, string>>;
};

const pregnancyUnknown = "No safety data in pregnancy or breastfeeding.";

export const supplements: Supplement[] = [
  {
    slug: "creatine",
    name: "Creatine monohydrate",
    goals: ["muscle", "brain", "performance"],
    evidence: "Strong",
    summary: "More strength and muscle from the same training. Some evidence for memory and focus, mostly when sleep-deprived.",
    whatItDoes:
      "Creatine is the most researched sports supplement there is. Across hundreds of trials it adds a few extra reps per set, which over months becomes more strength and lean mass than training alone. Your brain also runs on creatine, and trials show small gains in memory and mental fatigue, most clearly in vegetarians, older adults, and people short on sleep.",
    howItWorks:
      "It tops up phosphocreatine, the fuel your muscles burn in the first 10 or so seconds of hard effort. Fuller stores mean you recover faster between sets and can do more work. Muscles also pull in water as they store it, which is why the scale moves 1–2 kg in the first weeks. That is water inside the muscle, not fat or bloating.",
    dose: {
      amount: "3–5 g a day, every day. Larger bodies sit at the top of the range.",
      perKg: { low: 0.04, high: 0.06, unit: "g", min: 3, max: 5, label: "Daily amount" },
      timing: "Any time of day. Taking it daily matters; timing does not.",
      form: "Plain creatine monohydrate powder. Look for Creapure or a third-party tested label; other forms are not better.",
      takesEffect: "Muscles are full after about 3–4 weeks. Loading (about 20 g a day split into four doses for 5–7 days) gets there in a week.",
    },
    whoBenefits: "Anyone lifting or doing sprints and intervals. Vegetarians and vegans start lower, so they tend to see more.",
    sideEffects: ["1–2 kg of water weight early on", "Stomach upset if you take a big dose at once"],
    interactions: [
      "Raises creatinine on blood tests without harming the kidney. Tell your doctor you take it so the result is read correctly.",
    ],
    flags: {
      kidney: "Kidney disease: creatine needs your nephrologist's sign-off.",
      pregnant: pregnancyUnknown,
    },
  },
  {
    slug: "protein",
    name: "Protein powder",
    aka: "Whey, casein, or plant protein",
    goals: ["muscle", "metabolic"],
    evidence: "Strong",
    summary: "Not magic, just an easy way to hit the daily protein that builds muscle and keeps you full.",
    whatItDoes:
      "Total daily protein is what drives muscle growth and protects muscle while you lose fat. Powder is simply food in a convenient form. It helps when meals fall short of your target, and it is one of the cheapest grams of protein you can buy.",
    howItWorks:
      "Training sends the signal to build muscle; protein supplies the amino acids to do it. Leucine, which whey is especially rich in, switches on muscle protein synthesis. High-protein diets also keep you fuller and burn slightly more energy in digestion, which helps during a cut.",
    dose: {
      amount: "Total protein of 1.6–2.2 g per kg of body weight a day, from food and powder together. A scoop is usually 20–30 g.",
      perKg: { low: 1.6, high: 2.2, unit: "g", label: "Daily protein from all food" },
      timing: "Spread over 3–5 meals of about 0.4 g/kg each. Within a couple of hours of training is fine; there is no tight window.",
      form: "Whey isolate if dairy bothers you; a pea and rice blend if you are plant-based. Pick a third-party tested brand (NSF, Informed Sport).",
      takesEffect: "Muscle gain shows over 8–12 weeks of training.",
    },
    whoBenefits: "People training for muscle, dieting, or over 50 when muscle loss speeds up.",
    sideEffects: ["Bloating or gas, mostly from lactose in whey concentrate"],
    interactions: [],
    flags: {
      kidney: "Kidney disease: your protein target should come from your clinician; it is often lower.",
    },
  },
  {
    slug: "tongkat-ali",
    name: "Tongkat ali",
    aka: "Eurycoma longifolia, longjack",
    goals: ["testosterone", "stress"],
    evidence: "Some",
    summary: "A modest rise in testosterone in men whose levels start low, with less stress and better mood.",
    whatItDoes:
      "Small trials in middle-aged men, mostly with low or borderline testosterone or high stress, found testosterone rose and fatigue, mood, and libido improved over 4–12 weeks. Men with normal levels see little change. It is not a replacement for medical treatment of low testosterone.",
    howItWorks:
      "The root's compounds (eurycomanone and related quassinoids) appear to free up more testosterone by lowering SHBG, the protein that binds it, and to support the testes' own production. Lower cortisol may also help, since chronic stress suppresses testosterone.",
    dose: {
      amount: "200–400 mg a day of a standardised root extract.",
      timing: "Morning, with food.",
      form: "A standardised water extract with the extract ratio or eurycomanone content on the label (Physta, LJ100). Buy third-party tested; untested tongkat has been found with lead and mercury.",
      takesEffect: "4–12 weeks in trials.",
    },
    whoBenefits: "Men with low or low-normal testosterone, or under heavy stress. Get a blood test first so you know where you start.",
    sideEffects: ["Restlessness or poor sleep in some people", "Rare reports of liver injury with untested products"],
    interactions: ["May interact with blood-pressure and diabetes medicine; check with a pharmacist."],
    flags: {
      cancer: "Hormone-sensitive cancer (prostate, breast): do not raise testosterone without your oncologist.",
      pregnant: "Not for pregnancy or breastfeeding.",
      cardio: "Heart condition: check with your clinician before changing hormones.",
    },
  },
  {
    slug: "zinc",
    name: "Zinc",
    goals: ["testosterone", "foundation"],
    evidence: "Good",
    summary: "Needed to make testosterone and for immunity. It only raises testosterone if you are low.",
    whatItDoes:
      "Zinc is a mineral your body needs to make testosterone, heal, and run your immune system. In men who are short of it, supplementing brings testosterone back up. If your zinc is already normal, more does not raise testosterone further. Heavy sweaters, vegetarians, and heavy drinkers run low more often.",
    howItWorks:
      "Zinc is needed by hundreds of enzymes, including the ones in the testes that make testosterone and in the immune cells that fight infection. Taken at the first sign of a cold, zinc lozenges may shorten it a little.",
    dose: {
      amount: "15–30 mg a day, as elemental zinc.",
      timing: "With a meal; on an empty stomach it can cause nausea.",
      form: "Zinc picolinate, citrate, or bisglycinate. Check the label for elemental zinc, not the weight of the whole salt.",
      takesEffect: "About 3 months to correct a deficiency.",
      upperLimit: "40 mg a day. Above that for months, zinc causes copper deficiency, which can damage nerves and blood.",
    },
    whoBenefits: "People low in zinc: heavy sweaters, plant-based eaters, and people with gut absorption problems.",
    sideEffects: ["Nausea on an empty stomach", "Copper deficiency with long-term high doses"],
    interactions: ["Take 2 hours apart from tetracycline or quinolone antibiotics, and from iron supplements."],
    flags: {},
  },
  {
    slug: "omega-3",
    name: "Omega-3 fish oil",
    aka: "EPA and DHA",
    goals: ["heart", "brain", "joints"],
    evidence: "Good",
    summary: "Lowers triglycerides and supports heart, brain, and joints, especially if you rarely eat oily fish.",
    whatItDoes:
      "EPA and DHA lower blood triglycerides reliably and modestly reduce cardiovascular events in some higher-risk groups. DHA is a building block of brain cell membranes; the evidence for sharper thinking in healthy adults is mixed, but EPA-heavy oils help low mood in several trials. They also ease joint stiffness a little.",
    howItWorks:
      "They are built into cell membranes and turned into signals that calm inflammation. In the liver they slow the making of triglycerides.",
    dose: {
      amount: "1–2 g of EPA and DHA combined a day. Count EPA plus DHA on the label, not the total fish oil.",
      timing: "With a meal that has some fat, which cuts fishy burps and helps absorption.",
      form: "Triglyceride-form fish oil or algae oil (vegan). Third-party tested for oxidation and mercury (IFOS).",
      takesEffect: "Blood levels rise over 8–12 weeks.",
    },
    whoBenefits: "People who eat oily fish less than twice a week, and people with high triglycerides.",
    sideEffects: ["Fishy burps", "Loose stools at higher doses", "A small rise in atrial fibrillation risk at 4 g a day and above"],
    interactions: ["Adds to bleeding risk with blood thinners (warfarin, apixaban, clopidogrel)."],
    flags: {
      cardio: "Heart, blood-pressure, or clotting condition: check with your clinician, especially on blood thinners.",
    },
  },
  {
    slug: "vitamin-d",
    name: "Vitamin D3",
    goals: ["foundation", "testosterone", "muscle"],
    evidence: "Good",
    summary: "Most Canadians run low in winter. It matters for bones, muscle, immunity, and mood when you are low.",
    whatItDoes:
      "Vitamin D is made in your skin from sunlight, so from October to March most people in Canada make almost none. Correcting a deficiency helps bones, muscle strength, and immune defence, and may help mood and testosterone in men who were low. If your level is already normal, more brings no extra benefit.",
    howItWorks:
      "It acts like a hormone: once converted in the liver and kidney, it switches on genes for calcium absorption, muscle function, and immune cells.",
    dose: {
      amount: "1,000–2,000 IU (25–50 mcg) a day for most adults. Test your 25-OH vitamin D level to know your real need.",
      timing: "With your largest meal; it needs fat to be absorbed.",
      form: "D3 (cholecalciferol), not D2. Often paired with K2.",
      takesEffect: "Blood levels settle after about 3 months.",
      upperLimit: "4,000 IU a day unless your doctor prescribes more after a blood test.",
    },
    whoBenefits: "Anyone in northern winters, people with darker skin, older adults, and anyone who covers up or stays indoors.",
    sideEffects: ["High calcium only with very high doses over time"],
    interactions: ["Thiazide diuretics with high doses can raise calcium."],
    flags: {
      kidney: "Kidney disease: vitamin D handling changes; dose with your nephrologist.",
    },
  },
  {
    slug: "magnesium",
    name: "Magnesium",
    goals: ["sleep", "stress", "muscle", "foundation"],
    evidence: "Some",
    summary: "Many people eat too little. Topping up can help sleep, cramps, and stress.",
    whatItDoes:
      "Most adults eat less magnesium than recommended, and hard training sweats more out. When intake is low, supplementing improves sleep quality, muscle cramps, and blood pressure a little. Evidence that it helps people who already get enough is weak.",
    howItWorks:
      "It is needed for energy production, muscle relaxation, and the calming GABA system in the brain. Low magnesium leaves nerves and muscles more excitable.",
    dose: {
      amount: "200–350 mg of elemental magnesium a day from supplements.",
      timing: "Evening, if you take it for sleep.",
      form: "Glycinate or bisglycinate (gentle, calming); citrate (also loosens stools). Avoid oxide; little is absorbed.",
      takesEffect: "A few weeks.",
      upperLimit: "350 mg a day from supplements; food magnesium does not count toward this.",
    },
    whoBenefits: "People with poor sleep, cramps, high stress, or a diet light on greens, nuts, seeds, and legumes.",
    sideEffects: ["Loose stools, mostly with citrate and oxide"],
    interactions: ["Take 2–4 hours apart from some antibiotics, thyroid medicine, and osteoporosis drugs."],
    flags: {
      kidney: "Kidney disease: magnesium can build up to dangerous levels. Do not take it without your clinician.",
    },
  },
  {
    slug: "ashwagandha",
    name: "Ashwagandha",
    aka: "Withania somnifera",
    goals: ["stress", "sleep", "testosterone"],
    evidence: "Good",
    summary: "Lowers stress and cortisol and helps sleep. A small testosterone rise in men in several trials.",
    whatItDoes:
      "Across a dozen-plus trials, ashwagandha root extract lowered perceived stress, anxiety scores, and cortisol, and improved sleep quality. In men who trained, several trials also found slightly more strength and higher testosterone.",
    howItWorks:
      "It is an adaptogen: its withanolides appear to calm the stress-hormone axis (HPA axis) and act on GABA receptors, the same calming system targeted by some sleep aids.",
    dose: {
      amount: "300–600 mg a day of a root extract.",
      timing: "Once daily, or split morning and evening. Evening if you take it for sleep.",
      form: "Standardised root extract (KSM-66 or Sensoril).",
      takesEffect: "4–8 weeks.",
    },
    whoBenefits: "Stressed people sleeping badly, and men looking for a small strength and testosterone edge.",
    sideEffects: ["Drowsiness or stomach upset", "Rare liver injury reported", "Can raise thyroid hormone"],
    interactions: [
      "Thyroid medicine, sedatives, and immune-suppressing drugs. Stop two weeks before surgery.",
      "Not for autoimmune conditions without your doctor.",
    ],
    flags: {
      pregnant: "Avoid in pregnancy: traditionally linked with miscarriage.",
      cancer: "Hormone-sensitive cancer: check with your oncologist.",
    },
  },
  {
    slug: "caffeine",
    name: "Caffeine",
    goals: ["performance", "brain", "metabolic"],
    evidence: "Strong",
    summary: "The most reliable legal performance boost: more endurance, power, and focus.",
    whatItDoes:
      "Caffeine improves endurance, strength, and power by a few percent, sharpens attention and reaction time, and makes hard effort feel easier. It also raises energy burn slightly.",
    howItWorks:
      "It blocks adenosine, the molecule that builds up through the day and makes you feel tired. It also raises adrenaline.",
    dose: {
      amount: "3–6 mg per kg of body weight, 30–60 minutes before training. Start at the low end.",
      perKg: { low: 3, high: 6, unit: "mg", max: 400, label: "Before training" },
      timing: "30–60 minutes before training, and nothing within 8 hours of bed.",
      form: "Coffee, tea, or caffeine tablets. Pre-workouts often hide high doses; read the label.",
      takesEffect: "30–60 minutes.",
      upperLimit: "400 mg a day for healthy adults; 300 mg in pregnancy.",
    },
    whoBenefits: "Anyone training or needing focus, if it does not hurt their sleep.",
    sideEffects: ["Jitters, anxiety, a racing heart", "Poor sleep", "Tolerance with daily use"],
    interactions: ["Stimulant ADHD medicine, some antibiotics, and thyroid medicine can strengthen its effects."],
    flags: {
      cardio: "Heart rhythm or blood-pressure condition: check with your clinician before using it to train.",
      pregnant: "Pregnancy: keep total caffeine under 300 mg a day.",
    },
  },
  {
    slug: "l-theanine",
    name: "L-theanine",
    goals: ["brain", "stress", "sleep"],
    evidence: "Some",
    summary: "Calm focus. Takes the edge off caffeine without making you sleepy.",
    whatItDoes:
      "An amino acid from tea. With caffeine it improves attention and task switching and blunts jitters. On its own it eases stress and may help you fall asleep.",
    howItWorks: "It raises calming GABA and alpha brain waves, the relaxed-but-alert state.",
    dose: {
      amount: "100–200 mg. With caffeine, about twice the caffeine dose (200 mg with 100 mg caffeine).",
      timing: "With your coffee, or 30–60 minutes before bed.",
      form: "L-theanine capsules (Suntheanine is well studied).",
      takesEffect: "Within an hour.",
    },
    whoBenefits: "Coffee drinkers who get jittery, and anyone with a busy, anxious mind.",
    sideEffects: ["Very few; mild headache in some people"],
    interactions: ["May add to blood-pressure-lowering medicine."],
    flags: {},
  },
  {
    slug: "beta-alanine",
    name: "Beta-alanine",
    goals: ["performance", "muscle"],
    evidence: "Good",
    summary: "More reps and longer hard efforts that last 1–4 minutes.",
    whatItDoes:
      "It delays the burn in hard efforts lasting about 1 to 4 minutes, such as high-rep sets, rowing, or intervals. It does little for single heavy lifts or long, easy cardio.",
    howItWorks: "It raises carnosine in muscle, which soaks up the acid that builds up during intense work.",
    dose: {
      amount: "3.2–6.4 g a day, split into doses of 1.6 g or less.",
      timing: "Any time; it works by building up, not by timing. With meals reduces tingling.",
      form: "Plain or sustained-release beta-alanine (CarnoSyn).",
      takesEffect: "4 weeks or more of daily use.",
    },
    whoBenefits: "People doing high-rep training, CrossFit-style workouts, combat sports, or intervals.",
    sideEffects: ["Harmless tingling of the skin (paresthesia), worse with larger single doses"],
    interactions: [],
    flags: { pregnant: pregnancyUnknown },
  },
  {
    slug: "citrulline",
    name: "L-citrulline",
    aka: "Citrulline malate",
    goals: ["performance", "heart"],
    evidence: "Some",
    summary: "Better blood flow and pump, slightly more reps, and less soreness.",
    whatItDoes:
      "Citrulline raises nitric oxide more reliably than arginine. Trials show a few more reps, less soreness the next day, and a small drop in blood pressure.",
    howItWorks: "The kidneys turn it into arginine, which your blood vessels use to make nitric oxide and relax.",
    dose: {
      amount: "6–8 g of citrulline malate, or 3–6 g of pure L-citrulline.",
      timing: "About 60 minutes before training.",
      form: "Citrulline malate 2:1 or pure L-citrulline.",
      takesEffect: "Same session.",
    },
    whoBenefits: "Lifters wanting more volume and pump.",
    sideEffects: ["Stomach upset at high doses"],
    interactions: ["Adds to blood-pressure medicine and to erectile-dysfunction drugs (sildenafil, tadalafil)."],
    flags: { cardio: "Blood-pressure medicine: it lowers pressure further. Check with your clinician." },
  },
  {
    slug: "electrolytes",
    name: "Electrolytes",
    aka: "Sodium, potassium, magnesium",
    goals: ["performance"],
    evidence: "Good",
    summary: "Replaces the salt you sweat out, so long sessions do not fade or cramp.",
    whatItDoes:
      "In long or very sweaty sessions you lose sodium faster than water alone can replace. Topping it up keeps performance up and lowers the risk of cramps and of the dangerous low sodium that comes from drinking lots of plain water.",
    howItWorks: "Sodium keeps water in your blood and lets nerves and muscles fire.",
    dose: {
      amount: "300–600 mg of sodium per hour of sweaty exercise; more for heavy, salty sweaters.",
      timing: "During sessions longer than 60 minutes, or in heat.",
      form: "Drink mixes or tablets. Look at the sodium number; many are mostly sugar.",
      takesEffect: "Immediate.",
    },
    whoBenefits: "Endurance athletes, people training in heat, and anyone whose shirt dries white with salt.",
    sideEffects: ["Thirst and bloating if you overdo it"],
    interactions: [],
    flags: {
      cardio: "High blood pressure or heart failure: sodium targets should come from your clinician.",
      kidney: "Kidney disease: potassium and sodium limits come from your clinician.",
    },
  },
  {
    slug: "glycine",
    name: "Glycine",
    goals: ["sleep"],
    evidence: "Early",
    summary: "Fall asleep faster and wake up less groggy.",
    whatItDoes: "Small Japanese trials found 3 g before bed helped people fall asleep faster, sleep more deeply, and feel sharper the next day.",
    howItWorks: "It slightly lowers core body temperature, one of the signals that starts sleep, and calms the brain.",
    dose: {
      amount: "3 g.",
      timing: "30–60 minutes before bed.",
      form: "Glycine powder; it tastes sweet and dissolves in water.",
      takesEffect: "The first night.",
    },
    whoBenefits: "People who struggle to fall asleep and want something gentler than melatonin.",
    sideEffects: ["Rarely, mild stomach upset"],
    interactions: ["Not with clozapine."],
    flags: {},
  },
  {
    slug: "melatonin",
    name: "Melatonin",
    goals: ["sleep"],
    evidence: "Good",
    summary: "Resets your body clock: jet lag, shift work, and late sleepers. Less is often more.",
    whatItDoes:
      "Melatonin tells your body it is night. It helps most with jet lag, shift work, and body clocks that run late. For everyday insomnia it shortens the time to fall asleep only a little.",
    howItWorks: "It is the hormone your brain releases in darkness to start the night.",
    dose: {
      amount: "0.5–3 mg. Low doses often work as well as high ones, with less grogginess.",
      timing: "30–60 minutes before your target bedtime. For jet lag, at local bedtime at your destination.",
      form: "Immediate release to fall asleep; prolonged release to stay asleep.",
      takesEffect: "The first night.",
    },
    whoBenefits: "Travellers, shift workers, and people whose sleep drifts later and later.",
    sideEffects: ["Morning grogginess", "Vivid dreams", "Headache"],
    interactions: ["Blood thinners, sedatives, diabetes medicine, and immune-suppressing drugs."],
    flags: { pregnant: pregnancyUnknown },
  },
  {
    slug: "rhodiola",
    name: "Rhodiola rosea",
    goals: ["stress", "brain"],
    evidence: "Some",
    summary: "Less mental fatigue under stress and burnout.",
    whatItDoes: "Trials in stressed workers, students, and doctors on night shifts found less mental fatigue and better concentration. Results are mixed in healthy, rested people.",
    howItWorks: "An adaptogen thought to steady the stress-hormone response and brain chemicals such as serotonin and dopamine.",
    dose: {
      amount: "200–600 mg a day of a standardised extract.",
      timing: "Morning; it can be stimulating late in the day.",
      form: "Extract standardised to about 3% rosavins and 1% salidroside (SHR-5).",
      takesEffect: "1–4 weeks.",
    },
    whoBenefits: "People worn down by long-term stress or burnout.",
    sideEffects: ["Restlessness or poor sleep if taken late"],
    interactions: ["Antidepressants (SSRIs, MAOIs) and stimulants."],
    flags: { pregnant: pregnancyUnknown },
  },
  {
    slug: "lions-mane",
    name: "Lion's mane",
    aka: "Hericium erinaceus",
    goals: ["brain"],
    evidence: "Early",
    summary: "A mushroom studied for memory and nerve health. Early, small trials.",
    whatItDoes: "A few small trials in older adults with mild memory problems found modest gains in thinking tests that faded after stopping. Evidence in healthy young people is thin.",
    howItWorks: "Compounds in the mushroom (hericenones and erinacines) raise nerve growth factor in lab and animal studies.",
    dose: {
      amount: "1–3 g a day of fruiting-body extract.",
      timing: "With food.",
      form: "Fruiting-body extract with beta-glucan content listed, rather than grain-grown mycelium.",
      takesEffect: "8–16 weeks in trials.",
    },
    whoBenefits: "Older adults interested in memory, who understand the evidence is early.",
    sideEffects: ["Stomach upset", "Skin rash in people allergic to mushrooms"],
    interactions: ["May add to blood thinners and diabetes medicine."],
    flags: { pregnant: pregnancyUnknown },
  },
  {
    slug: "collagen",
    name: "Collagen peptides",
    goals: ["joints"],
    evidence: "Some",
    summary: "Supports tendons, joints, and skin elasticity.",
    whatItDoes:
      "Trials show modest improvements in skin elasticity and hydration, and less activity-related joint pain. Taken with vitamin C before training, it may help tendons and ligaments build collagen.",
    howItWorks: "It supplies the amino acids collagen is made from (glycine, proline, hydroxyproline), and some collagen fragments appear to signal the cells that build it.",
    dose: {
      amount: "10–15 g a day for joints and tendons; 2.5–10 g for skin. Add about 50 mg of vitamin C.",
      timing: "30–60 minutes before training or rehab exercise for tendons; any time for skin.",
      form: "Hydrolysed collagen peptides or gelatin.",
      takesEffect: "8–12 weeks.",
    },
    whoBenefits: "Athletes with achy tendons or joints, and people interested in skin ageing.",
    sideEffects: ["Very few; feeling full"],
    interactions: [],
    flags: {},
  },
  {
    slug: "psyllium",
    name: "Psyllium fibre",
    goals: ["gut", "heart", "metabolic"],
    evidence: "Strong",
    summary: "Lowers LDL cholesterol and blood sugar spikes, keeps you regular and full.",
    whatItDoes: "Psyllium reliably lowers LDL cholesterol by 5–10%, softens blood sugar spikes after meals, and helps both constipation and loose stools. It also adds fullness when dieting.",
    howItWorks: "It forms a gel in the gut that traps bile acids (so the liver uses up cholesterol to make more) and slows sugar absorption.",
    dose: {
      amount: "5–10 g a day, with at least 250 mL of water per 5 g.",
      timing: "Before meals. Keep it 2 hours away from medicines.",
      form: "Psyllium husk powder (Metamucil, unflavoured husk).",
      takesEffect: "Cholesterol falls over 4–8 weeks; regularity within days.",
    },
    whoBenefits: "Most adults; few people reach the 25–38 g of daily fibre recommended.",
    sideEffects: ["Gas and bloating at first; start low"],
    interactions: ["Slows absorption of many medicines; take them 2 hours apart."],
    flags: { diabetes: "On glucose-lowering medicine: it lowers blood sugar further. Monitor and tell your clinician." },
  },
  {
    slug: "berberine",
    name: "Berberine",
    goals: ["metabolic", "heart"],
    evidence: "Good",
    summary: "Lowers blood sugar and cholesterol; sometimes called nature's metformin.",
    whatItDoes: "In trials of people with high blood sugar or cholesterol, berberine lowered fasting glucose, HbA1c, LDL, and triglycerides, sometimes close to first-line drugs. Weight loss is small.",
    howItWorks: "It switches on AMPK, an energy sensor in cells that improves insulin sensitivity, and raises LDL receptors in the liver.",
    dose: {
      amount: "500 mg two or three times a day (1,000–1,500 mg total).",
      timing: "With meals.",
      form: "Berberine HCl.",
      takesEffect: "8–12 weeks.",
    },
    whoBenefits: "People with prediabetes or high cholesterol, under their doctor's eye.",
    sideEffects: ["Constipation, cramps, or diarrhoea"],
    interactions: ["Interacts with many drugs (cyclosporine, some statins, blood thinners) by slowing liver enzymes. Ask a pharmacist."],
    flags: {
      diabetes: "On glucose-lowering medicine: risk of low blood sugar. Only with your clinician.",
      pregnant: "Not in pregnancy or breastfeeding: it can harm the baby.",
    },
  },
  {
    slug: "coq10",
    name: "CoQ10",
    aka: "Ubiquinol",
    goals: ["heart"],
    evidence: "Some",
    summary: "Cellular energy for the heart; mainly for statin users and heart failure.",
    whatItDoes: "Statins lower your body's own CoQ10. Supplementing may ease statin muscle aches in some people, and in heart failure it improved outcomes in one larger trial.",
    howItWorks: "It carries electrons in the mitochondria, where cells make energy, and acts as an antioxidant.",
    dose: {
      amount: "100–200 mg a day.",
      timing: "With a meal that has fat.",
      form: "Ubiquinol is better absorbed than ubiquinone, especially over 40.",
      takesEffect: "4–12 weeks.",
    },
    whoBenefits: "People on statins with muscle aches, and people with heart failure under care.",
    sideEffects: ["Mild stomach upset", "Insomnia if taken late"],
    interactions: ["May weaken warfarin; blood tests should be watched."],
    flags: { cardio: "Heart or clotting condition: check with your clinician, especially on warfarin." },
  },
  {
    slug: "fenugreek",
    name: "Fenugreek",
    goals: ["testosterone", "metabolic"],
    evidence: "Some",
    summary: "Libido and a small testosterone effect in men; also lowers blood sugar.",
    whatItDoes: "Trials of standardised seed extract in men found improved libido and small rises in free testosterone, with a little extra strength alongside training. It also lowers blood sugar.",
    howItWorks: "Its saponins (furostanolic) may reduce the conversion of testosterone and free up more of it.",
    dose: {
      amount: "500–600 mg a day of a standardised extract.",
      timing: "With a meal.",
      form: "Testofen or a similar standardised seed extract.",
      takesEffect: "6–8 weeks.",
    },
    whoBenefits: "Men with low libido.",
    sideEffects: ["Maple-syrup smell in sweat and urine", "Gas"],
    interactions: ["Blood thinners and diabetes medicine."],
    flags: {
      diabetes: "On glucose-lowering medicine: risk of low blood sugar.",
      pregnant: "Avoid in pregnancy: can trigger contractions.",
    },
  },
  {
    slug: "boron",
    name: "Boron",
    goals: ["testosterone", "joints"],
    evidence: "Early",
    summary: "A trace mineral with tiny studies showing more free testosterone.",
    whatItDoes: "One small week-long study found 10 mg a day raised free testosterone and lowered estradiol in men. It also plays a role in bone and joint health. The evidence is very thin.",
    howItWorks: "It may lower SHBG, freeing more testosterone, and helps vitamin D and magnesium work.",
    dose: {
      amount: "6–10 mg a day.",
      timing: "With food.",
      form: "Boron citrate or glycinate.",
      takesEffect: "1–2 weeks in the one small study.",
      upperLimit: "20 mg a day.",
    },
    whoBenefits: "Men curious about free testosterone, who understand the evidence is early.",
    sideEffects: ["Nausea at high doses"],
    interactions: [],
    flags: {
      cancer: "Hormone-sensitive cancer: check with your oncologist.",
      kidney: "Kidney disease: boron is cleared by the kidneys.",
    },
  },
  {
    slug: "vitamin-b12",
    name: "Vitamin B12",
    goals: ["foundation", "brain"],
    evidence: "Strong",
    summary: "Essential for energy, nerves, and blood. Vegans and metformin users run low.",
    whatItDoes: "B12 deficiency causes fatigue, anaemia, numbness, and memory problems. Supplementing fixes a deficiency; it does not add energy if you already have enough.",
    howItWorks: "It is needed to make red blood cells, DNA, and the myelin that insulates nerves.",
    dose: {
      amount: "250–500 mcg a day, or 1,000 mcg a few times a week.",
      timing: "Any time.",
      form: "Methylcobalamin or cyanocobalamin; both work.",
      takesEffect: "Weeks to months to correct a deficiency.",
    },
    whoBenefits: "Vegans and vegetarians, adults over 50, and people on metformin or acid-reducing drugs.",
    sideEffects: ["Very few"],
    interactions: ["Metformin and acid reducers (PPIs) lower absorption."],
    flags: {},
  },
];

export function getSupplement(slug: string): Supplement | undefined {
  return supplements.find((supplement) => supplement.slug === slug);
}

export function goalName(slug: SupplementGoal): string {
  return supplementGoals.find((goal) => goal.slug === slug)?.name ?? slug;
}

/** Weight-based amount, clamped and rounded to something you can measure. */
export function amountFor(perKg: PerKg, weightKg: number): string {
  const clamp = (n: number) => Math.min(perKg.max ?? Infinity, Math.max(perKg.min ?? 0, n));
  const step = perKg.unit === "mg" ? 10 : perKg.low >= 1 ? 5 : 0.5;
  const round = (n: number) => Math.round(n / step) * step;
  const low = round(clamp(perKg.low * weightKg));
  const high = round(clamp(perKg.high * weightKg));
  return low === high ? `${low} ${perKg.unit}` : `${low}–${high} ${perKg.unit}`;
}
