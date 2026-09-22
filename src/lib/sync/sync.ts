import { syncClient } from "@/lib/sync/client";
import {
  loadCheckinMap,
  loadProfile,
  profileUpdatedAt,
  storeCheckins,
  storeProfile,
} from "@/lib/today/storage";
import type { DayState, UserContext } from "@/lib/today/types";

type ProfileRow = { data: UserContext; updated_at: string };
type CheckinRow = { day: string; data: DayState; updated_at: string };

async function userId(): Promise<string | null> {
  const supabase = syncClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

const newer = (a?: string | null, b?: string | null) => Date.parse(a ?? "") > Date.parse(b ?? "");

export async function pushProfile(profile: UserContext, updatedAt: string) {
  const supabase = syncClient();
  const id = await userId();
  if (!supabase || !id) return;
  await supabase.from("profiles").upsert({ user_id: id, data: profile, updated_at: updatedAt });
}

export async function pushCheckin(day: DayState) {
  const supabase = syncClient();
  const id = await userId();
  if (!supabase || !id) return;
  const updatedAt = day.updatedAt ?? new Date().toISOString();
  await supabase.from("checkins").upsert({ user_id: id, day: day.date, data: day, updated_at: updatedAt });
}

/**
 * Two-way merge between this browser and the account. For the profile and
 * for each day, whichever copy was edited most recently wins; anything newer
 * locally is uploaded.
 */
export async function syncNow(): Promise<{ ok: boolean; message?: string }> {
  const supabase = syncClient();
  const id = await userId();
  if (!supabase || !id) return { ok: false, message: "Not signed in." };

  const [profileResult, checkinResult] = await Promise.all([
    supabase.from("profiles").select("data, updated_at").eq("user_id", id).maybeSingle<ProfileRow>(),
    supabase.from("checkins").select("day, data, updated_at").eq("user_id", id).returns<CheckinRow[]>(),
  ]);
  if (profileResult.error || checkinResult.error) {
    return { ok: false, message: (profileResult.error ?? checkinResult.error)?.message };
  }

  // Profile
  const remoteProfile = profileResult.data;
  const localProfile = loadProfile();
  const localUpdated = profileUpdatedAt();
  if (remoteProfile && (!localProfile || newer(remoteProfile.updated_at, localUpdated))) {
    storeProfile(remoteProfile.data, remoteProfile.updated_at);
  } else if (localProfile) {
    const stamp = localUpdated ?? new Date().toISOString();
    await supabase.from("profiles").upsert({ user_id: id, data: localProfile, updated_at: stamp });
  }

  // Check-ins
  const local = loadCheckinMap();
  const remote = new Map((checkinResult.data ?? []).map((row) => [row.day, row]));
  const uploads: { user_id: string; day: string; data: DayState; updated_at: string }[] = [];

  for (const [day, row] of remote) {
    if (!local[day] || newer(row.updated_at, local[day].updatedAt)) {
      local[day] = { ...row.data, updatedAt: row.updated_at };
    }
  }
  for (const [day, entry] of Object.entries(local)) {
    const row = remote.get(day);
    if (!row || newer(entry.updatedAt, row.updated_at)) {
      const updatedAt = entry.updatedAt ?? new Date().toISOString();
      uploads.push({ user_id: id, day, data: { ...entry, updatedAt }, updated_at: updatedAt });
    }
  }
  storeCheckins(local);
  if (uploads.length > 0) {
    const { error } = await supabase.from("checkins").upsert(uploads);
    if (error) return { ok: false, message: error.message };
  }
  return { ok: true };
}

/** Deletes the account; profile and check-ins cascade in the database. */
export async function deleteAccount(): Promise<{ ok: boolean; message?: string }> {
  const supabase = syncClient();
  if (!supabase) return { ok: false, message: "Accounts are not switched on." };
  const { error } = await supabase.rpc("delete_my_account");
  if (error) return { ok: false, message: error.message };
  await supabase.auth.signOut();
  return { ok: true };
}
