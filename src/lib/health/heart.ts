import { syncClient } from "@/lib/sync/client";

/** Name the Shortcut must be saved under; the Today page runs it by name. */
export const SHORTCUT_NAME = "Aevum Heart";

export type HeartReading = { measuredAt: string; rhr?: number; hrv?: number; respRate?: number };

type Row = { measured_at: string; rhr: number | null; hrv: number | null; resp_rate: number | null };

/** The newest reading the Shortcut has sent for the signed-in user. */
export async function latestReading(): Promise<HeartReading | null> {
  const supabase = syncClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("aevum_heart_readings")
    .select("measured_at, rhr, hrv, resp_rate")
    .order("measured_at", { ascending: false })
    .limit(1)
    .maybeSingle<Row>();
  if (!data) return null;
  return {
    measuredAt: data.measured_at,
    rhr: data.rhr === null ? undefined : Number(data.rhr),
    hrv: data.hrv === null ? undefined : Number(data.hrv),
    respRate: data.resp_rate === null ? undefined : Number(data.resp_rate),
  };
}

/** Local calendar date of a timestamp, matching todayIso(). */
export function localDate(iso: string): string {
  const at = new Date(iso);
  return new Date(at.getTime() - at.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

/** Opens the Shortcut on this iPhone with the key as its input, so it saves the key and sends a first reading. */
export function linkUrl(key: string): string {
  return `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME)}&input=text&text=${encodeURIComponent(key)}`;
}
