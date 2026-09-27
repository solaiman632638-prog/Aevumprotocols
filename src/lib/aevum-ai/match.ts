/**
 * Matching free text against a list of names, forgiving the spelling people
 * actually type. Pure string work with no dependencies, so it can be tested
 * on its own and reused wherever a name has to be recognised.
 */

/** Strips case, spaces and punctuation so "BPC 157" and "bpc-157" agree. */
export function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Levenshtein distance, abandoned early once it passes `max`. */
export function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
      best = Math.min(best, current[j]);
    }
    if (best > max) return max + 1;
    previous = current;
  }
  return previous[b.length];
}

/** How much misspelling to forgive, scaled to how long the name is. */
export function tolerance(length: number): number {
  if (length <= 4) return 0;
  if (length <= 7) return 1;
  if (length <= 12) return 2;
  return 3;
}

/**
 * The best candidate for `text`, or null. Exact match wins, then one name
 * containing the other, then the closest spelling within tolerance.
 */
export function bestMatch<T>(text: string, candidates: T[], keysOf: (item: T) => string[]): T | null {
  const needle = normalise(text);
  if (needle.length < 3) return null;

  const entries = candidates.map((item) => ({ item, keys: keysOf(item).map(normalise).filter(Boolean) }));

  for (const entry of entries) {
    if (entry.keys.includes(needle)) return entry.item;
  }

  for (const entry of entries) {
    if (entry.keys.some((key) => (key.length >= 4 && needle.includes(key)) || (needle.length >= 4 && key.includes(needle)))) {
      return entry.item;
    }
  }

  let best: { item: T; score: number } | null = null;
  for (const entry of entries) {
    for (const key of entry.keys) {
      const limit = tolerance(Math.max(key.length, needle.length));
      const score = distance(needle, key, limit);
      if (score <= limit && (!best || score < best.score)) best = { item: entry.item, score };
    }
  }
  return best?.item ?? null;
}

/** Words and adjacent pairs from a sentence, as match candidates. */
export function phrases(text: string): string[] {
  const words = text.split(/[^A-Za-z0-9-]+/).filter((word) => word.length >= 3);
  return [...words, ...words.slice(0, -1).map((word, i) => `${word} ${words[i + 1]}`)];
}
