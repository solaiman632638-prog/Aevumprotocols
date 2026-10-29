export function shiftDays(iso: string, by: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + by);
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

/** Consecutive logged days ending today, or yesterday if today is not in yet. */
export function streak(dates: Set<string>, today: string): number {
  let day = dates.has(today) ? today : shiftDays(today, -1);
  let count = 0;
  while (dates.has(day)) {
    count += 1;
    day = shiftDays(day, -1);
  }
  return count;
}

/** "Good morning" and friends, from the device clock. */
export function greeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 5) return "Good evening";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
