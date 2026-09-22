import { NextResponse } from "next/server";
import { appUrl, secureCookie, WHOOP_STATE, whoopConfigured } from "@/lib/wearables/oauth";

export async function GET() {
  if (!whoopConfigured()) {
    return NextResponse.json({ mode: "demo" });
  }
  // WHOOP requires a state value; checking it on return blocks forged callbacks.
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: process.env.WHOOP_CLIENT_ID ?? "",
    redirect_uri: `${appUrl()}/api/wearables/whoop/callback`,
    response_type: "code",
    scope: "read:recovery read:cycles read:sleep read:profile offline",
    state,
  });
  const response = NextResponse.json({
    mode: "live",
    url: `https://api.prod.whoop.com/oauth/oauth2/auth?${params.toString()}`,
  });
  response.cookies.set(WHOOP_STATE, state, { ...secureCookie, maxAge: 60 * 10 });
  return response;
}
