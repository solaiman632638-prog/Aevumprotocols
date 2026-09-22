import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { LiveDay } from "@/lib/wearables/demo";
import { secureCookie, WHOOP_REFRESH, WHOOP_TOKEN, whoopConfigured, whoopTokens } from "@/lib/wearables/oauth";

const API = "https://api.prod.whoop.com/developer/v2";

type Scored<T> = { score_state?: string; score?: T };
type RecoveryRecord = Scored<{ recovery_score?: number; resting_heart_rate?: number; hrv_rmssd_milli?: number }> & {
  sleep_id?: string;
  created_at: string;
};
type SleepRecord = Scored<{
  respiratory_rate?: number;
  stage_summary?: { total_in_bed_time_milli?: number; total_awake_time_milli?: number };
}> & { id: string; end: string; nap?: boolean; timezone_offset?: string };
type CycleRecord = Scored<{ strain?: number }> & { start: string; timezone_offset?: string };

/** ISO timestamp + "+hh:mm" offset → the user's local calendar date. */
function localDate(iso: string, offset = "+00:00"): string {
  const match = /^([+-])(\d{2}):(\d{2})$/.exec(offset);
  const minutes = match ? (match[1] === "-" ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3])) : 0;
  return new Date(Date.parse(iso) + minutes * 60_000).toISOString().slice(0, 10);
}

async function get<T>(path: string, token: string): Promise<T[] | "unauthorized" | null> {
  const response = await fetch(`${API}${path}?limit=25`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (response.status === 401) return "unauthorized";
  if (!response.ok) return null;
  return ((await response.json()) as { records?: T[] }).records ?? [];
}

/** Last ~25 days of WHOOP recovery, sleep, and strain, one row per local date. */
export async function GET() {
  if (!whoopConfigured()) return NextResponse.json({ error: "not-configured" }, { status: 404 });

  const jar = await cookies();
  let token = jar.get(WHOOP_TOKEN)?.value;
  const refresh = jar.get(WHOOP_REFRESH)?.value;
  let renewed: Awaited<ReturnType<typeof whoopTokens>> = null;

  if (!token && refresh) {
    renewed = await whoopTokens({ refreshToken: refresh });
    token = renewed?.access_token;
  }
  if (!token) return NextResponse.json({ error: "not-connected" }, { status: 401 });

  let [recovery, sleep, cycles] = await Promise.all([
    get<RecoveryRecord>("/recovery", token),
    get<SleepRecord>("/activity/sleep", token),
    get<CycleRecord>("/cycle", token),
  ]);

  if ((recovery === "unauthorized" || sleep === "unauthorized" || cycles === "unauthorized") && refresh && !renewed) {
    renewed = await whoopTokens({ refreshToken: refresh });
    if (renewed) {
      token = renewed.access_token;
      [recovery, sleep, cycles] = await Promise.all([
        get<RecoveryRecord>("/recovery", token),
        get<SleepRecord>("/activity/sleep", token),
        get<CycleRecord>("/cycle", token),
      ]);
    }
  }
  if (!Array.isArray(recovery) || !Array.isArray(sleep) || !Array.isArray(cycles)) {
    return NextResponse.json({ error: "whoop-unavailable" }, { status: 502 });
  }

  const days = new Map<string, LiveDay>();
  const day = (date: string) => days.get(date) ?? days.set(date, { date }).get(date)!;
  const sleepDate = new Map<string, string>();

  for (const record of sleep) {
    if (record.nap || record.score_state !== "SCORED" || !record.score) continue;
    const date = localDate(record.end, record.timezone_offset);
    sleepDate.set(record.id, date);
    const stages = record.score.stage_summary;
    if (stages?.total_in_bed_time_milli != null) {
      const asleep = stages.total_in_bed_time_milli - (stages.total_awake_time_milli ?? 0);
      day(date).sleepHours = Math.round((asleep / 3_600_000) * 10) / 10;
    }
    if (record.score.respiratory_rate != null) day(date).respRate = Math.round(record.score.respiratory_rate * 10) / 10;
  }
  for (const record of recovery) {
    if (record.score_state !== "SCORED" || !record.score) continue;
    const date = (record.sleep_id && sleepDate.get(record.sleep_id)) || record.created_at.slice(0, 10);
    const entry = day(date);
    if (record.score.recovery_score != null) entry.recovery = Math.round(record.score.recovery_score);
    if (record.score.resting_heart_rate != null) entry.rhr = Math.round(record.score.resting_heart_rate);
    if (record.score.hrv_rmssd_milli != null) entry.hrv = Math.round(record.score.hrv_rmssd_milli);
  }
  for (const record of cycles) {
    if (record.score_state !== "SCORED" || record.score?.strain == null) continue;
    day(localDate(record.start, record.timezone_offset)).strain = Math.round(record.score.strain * 10) / 10;
  }

  const response = NextResponse.json({
    days: [...days.values()].sort((a, b) => a.date.localeCompare(b.date)),
  });
  if (renewed) {
    response.cookies.set(WHOOP_TOKEN, renewed.access_token, { ...secureCookie, maxAge: renewed.expires_in ?? 3600 });
    if (renewed.refresh_token) {
      response.cookies.set(WHOOP_REFRESH, renewed.refresh_token, { ...secureCookie, maxAge: 60 * 60 * 24 * 60 });
    }
  }
  return response;
}
