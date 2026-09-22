import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  appUrl,
  secureCookie,
  WHOOP_REFRESH,
  WHOOP_STATE,
  WHOOP_TOKEN,
  whoopConfigured,
  whoopTokens,
} from "@/lib/wearables/oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = (await cookies()).get(WHOOP_STATE)?.value;
  const back = (status: string) => {
    const response = NextResponse.redirect(new URL(`/monitor?connected=${status}`, appUrl()));
    response.cookies.delete(WHOOP_STATE);
    return response;
  };

  if (!whoopConfigured()) return back("demo");
  if (!code || !state || state !== expected) return back("error");

  const tokens = await whoopTokens({ code });
  if (!tokens) return back("error");

  const response = back("whoop");
  response.cookies.set(WHOOP_TOKEN, tokens.access_token, { ...secureCookie, maxAge: tokens.expires_in ?? 3600 });
  if (tokens.refresh_token) {
    response.cookies.set(WHOOP_REFRESH, tokens.refresh_token, { ...secureCookie, maxAge: 60 * 60 * 24 * 60 });
  }
  return response;
}
