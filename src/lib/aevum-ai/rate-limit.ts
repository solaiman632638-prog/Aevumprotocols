/**
 * In-memory fixed-window limiter. Enough to stop one person draining the
 * API budget on a single instance; a shared store would be needed across
 * several instances.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const MAX_PER_DAY = 120;

type Bucket = { windowStart: number; count: number; dayStart: number; dayCount: number };
const buckets = new Map<string, Bucket>();

export type RateVerdict = { ok: true } | { ok: false; retryAfter: number; reason: string };

export function checkRateLimit(key: string, now = Date.now()): RateVerdict {
  const bucket = buckets.get(key) ?? { windowStart: now, count: 0, dayStart: now, dayCount: 0 };

  if (now - bucket.windowStart >= WINDOW_MS) {
    bucket.windowStart = now;
    bucket.count = 0;
  }
  if (now - bucket.dayStart >= 86_400_000) {
    bucket.dayStart = now;
    bucket.dayCount = 0;
  }

  if (bucket.dayCount >= MAX_PER_DAY) {
    buckets.set(key, bucket);
    return { ok: false, retryAfter: 3600, reason: "Daily limit reached. Try again tomorrow." };
  }
  if (bucket.count >= MAX_PER_WINDOW) {
    buckets.set(key, bucket);
    const retryAfter = Math.ceil((WINDOW_MS - (now - bucket.windowStart)) / 1000);
    return { ok: false, retryAfter, reason: "Too many questions in a row. Wait a moment." };
  }

  bucket.count += 1;
  bucket.dayCount += 1;
  buckets.set(key, bucket);
  return { ok: true };
}

/** Test seam. */
export function resetRateLimits() {
  buckets.clear();
}
