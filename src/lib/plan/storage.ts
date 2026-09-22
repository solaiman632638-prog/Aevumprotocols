export const WEARABLE_KEY = "aevum-wearable";

export type WearableProvider = "whoop" | "google-fit";

export type WearableState = {
  provider: WearableProvider | "demo";
  connectedAt: string;
};

export function loadWearable(): WearableState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(WEARABLE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WearableState;
  } catch {
    return null;
  }
}

export function saveWearable(state: WearableState) {
  window.localStorage.setItem(WEARABLE_KEY, JSON.stringify(state));
}

export function clearWearable() {
  window.localStorage.removeItem(WEARABLE_KEY);
}
