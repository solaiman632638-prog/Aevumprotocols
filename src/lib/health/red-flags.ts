/**
 * Deterministic urgent-symptom detection. This runs before the model is
 * called and its result is never left to the model's judgement: if it fires,
 * the alert renders above everything else.
 */

export type RedFlag = {
  ruleId: string;
  severity: "urgent";
  title: string;
  description: string;
};

const RULES: { ruleId: string; title: string; patterns: RegExp[] }[] = [
  { ruleId: "chest-pain", title: "Chest pain or pressure", patterns: [/\bchest (pain|pressure|tightness)\b/, /\bcrushing chest\b/] },
  { ruleId: "breathing", title: "Severe difficulty breathing", patterns: [/\b(can'?t|cannot|struggling to) breathe\b/, /\bsevere(ly)? short(ness)? of breath\b/, /\bgasping\b/] },
  { ruleId: "fainting", title: "Fainting or near-fainting", patterns: [/\bfaint(ing|ed)?\b/, /\bpass(ed|ing) out\b/, /\bblack(ed|ing) out\b/] },
  { ruleId: "seizure", title: "Seizure", patterns: [/\bseizure(s)?\b/, /\bconvuls(ion|ing)\b/] },
  { ruleId: "anaphylaxis", title: "Possible anaphylaxis", patterns: [/\banaphylaxis\b/, /\b(throat|face|tongue|lip) (swelling|swollen)\b/, /\bswelling of (my )?(throat|face|tongue)\b/] },
  { ruleId: "neuro", title: "Sudden neurological change", patterns: [/\bslurred speech\b/, /\bface droop/, /\bstroke\b/, /\bsudden (weakness|numbness)\b/] },
  { ruleId: "confusion", title: "Severe confusion", patterns: [/\bsevere(ly)? confus(ed|ion)\b/, /\bunresponsive\b/] },
  { ruleId: "vomiting", title: "Severe persistent vomiting or dehydration", patterns: [/\b(can'?t|cannot) keep (anything|fluids|water) down\b/, /\bseverely dehydrated\b/] },
  { ruleId: "abdominal", title: "Severe abdominal pain", patterns: [/\bsevere (abdominal|stomach|belly) pain\b/, /\bworst (stomach|abdominal) pain\b/] },
  { ruleId: "infection", title: "Signs of severe infection", patterns: [/\bhigh fever\b/, /\bspreading redness\b/, /\bred streak(s)?\b/, /\bsepsis\b/] },
  { ruleId: "self-harm", title: "Thoughts of self-harm", patterns: [/\bsuicidal\b/, /\bkill myself\b/, /\bend my life\b/, /\bwant to die\b/, /\bharm myself\b/] },
  { ruleId: "overdose", title: "Intentional overdose", patterns: [/\boverdose(d)?\b/, /\btook (the )?whole (vial|bottle)\b/] },
];

/** Guards against "I don't have chest pain" reading as a red flag. */
const NEGATION = /\b(no|not|never|without|denies?|don'?t have|do not have|didn'?t have)\b[^.!?]{0,24}$/;

function negatedBefore(text: string, index: number): boolean {
  return NEGATION.test(text.slice(Math.max(0, index - 40), index));
}

/** Red flags present in free text plus any structured symptom labels. */
export function detectRedFlags(message: string, symptoms: string[] = []): RedFlag[] {
  const haystack = `${message} ${symptoms.join(" ")}`.toLowerCase();
  const found: RedFlag[] = [];

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const match = pattern.exec(haystack);
      if (!match) continue;
      if (negatedBefore(haystack, match.index)) continue;
      found.push({
        ruleId: rule.ruleId,
        severity: "urgent",
        title: rule.title,
        description: "This can need urgent assessment. It is not something to manage by adjusting a compound.",
      });
      break;
    }
  }

  return found;
}

export const URGENT_BANNER = {
  heading: "Urgent medical attention may be needed",
  body: "Some of what you described can require urgent assessment. Please consider seeking urgent medical care now, or call your local emergency number. Aevum cannot assess symptoms and will not suggest a compound change for this.",
};
