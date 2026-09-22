import type { DayState, UserContext } from "@/lib/today/types";

const PROFILE_KEY = "aevum-today-profile";
const CHECKINS_KEY = "aevum-checkins";
const SOURCE_KEY = "aevum-today-source";
const PROFILE_UPDATED_KEY = "aevum-today-profile-updated";

export type DataSource = "wearable" | "manual";

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

const CHANGE_EVENT = "aevum-storage";

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or full storage: the page still works for this visit.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** For useSyncExternalStore: fires on writes here and in other tabs. */
export function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

/** Raw stored string: a stable snapshot value for useSyncExternalStore. */
export function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export const keys = {
  profile: PROFILE_KEY,
  checkins: CHECKINS_KEY,
  source: SOURCE_KEY,
} as const;

/** Where saves are mirrored when the user is signed in. Set by SyncBridge. */
type Remote = {
  pushProfile: (profile: UserContext, updatedAt: string) => void;
  pushCheckin: (day: DayState) => void;
};
let remote: Remote | null = null;

export function registerRemote(next: Remote | null) {
  remote = next;
}

export function loadProfile(): UserContext | null {
  return read<UserContext>(PROFILE_KEY);
}

export function profileUpdatedAt(): string | null {
  return read<string>(PROFILE_UPDATED_KEY);
}

/** Local write only. Sync uses this to apply downloaded data without echoing it back. */
export function storeProfile(profile: UserContext, updatedAt: string) {
  write(PROFILE_KEY, profile);
  write(PROFILE_UPDATED_KEY, updatedAt);
}

export function saveProfile(profile: UserContext) {
  const updatedAt = new Date().toISOString();
  storeProfile(profile, updatedAt);
  remote?.pushProfile(profile, updatedAt);
}

/** Manual check-ins keyed by ISO date, newest wins. */
export function loadCheckins(): DayState[] {
  const map = read<Record<string, DayState>>(CHECKINS_KEY) ?? {};
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

export function loadCheckinMap(): Record<string, DayState> {
  return read<Record<string, DayState>>(CHECKINS_KEY) ?? {};
}

/** Local write only; see storeProfile. */
export function storeCheckins(map: Record<string, DayState>) {
  write(CHECKINS_KEY, map);
}

export function saveCheckin(day: DayState) {
  const stamped = { ...day, updatedAt: new Date().toISOString() };
  const map = loadCheckinMap();
  map[stamped.date] = stamped;
  storeCheckins(map);
  remote?.pushCheckin(stamped);
}

/** Removes everything Today keeps in this browser. */
export function clearLocalData() {
  for (const key of [PROFILE_KEY, PROFILE_UPDATED_KEY, CHECKINS_KEY, SOURCE_KEY]) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Nothing stored or storage blocked.
    }
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function loadSource(): DataSource | null {
  return read<DataSource>(SOURCE_KEY);
}

export function saveSource(source: DataSource) {
  write(SOURCE_KEY, source);
}

export function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
