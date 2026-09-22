export const WHOOP_TOKEN = "whoop_access";
export const WHOOP_REFRESH = "whoop_refresh";
export const WHOOP_STATE = "whoop_oauth_state";
export const GOOGLE_TOKEN = "google_fit_access";

const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";

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

export const secureCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export type WhoopTokens = { access_token: string; refresh_token?: string; expires_in?: number };

/** Exchange an authorization code or a refresh token for WHOOP tokens. */
export async function whoopTokens(grant: { code: string } | { refreshToken: string }): Promise<WhoopTokens | null> {
  const body = new URLSearchParams({
    client_id: process.env.WHOOP_CLIENT_ID ?? "",
    client_secret: process.env.WHOOP_CLIENT_SECRET ?? "",
    ...("code" in grant
      ? { grant_type: "authorization_code", code: grant.code, redirect_uri: `${appUrl()}/api/wearables/whoop/callback` }
      : { grant_type: "refresh_token", refresh_token: grant.refreshToken, scope: "offline" }),
  });
  const response = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as Partial<WhoopTokens>;
  return payload.access_token ? (payload as WhoopTokens) : null;
}
