export const WHOOP_TOKEN = "whoop_access";
export const GOOGLE_TOKEN = "google_fit_access";

export function whoopConfigured() {
  return Boolean(process.env.WHOOP_CLIENT_ID && process.env.WHOOP_CLIENT_SECRET);
}

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * Public origin for OAuth redirects. An explicit NEXT_PUBLIC_APP_URL wins;
 * on Vercel, the production domain Vercel injects is used when it is unset
 * or empty.
 */
export function appUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3002";
}
