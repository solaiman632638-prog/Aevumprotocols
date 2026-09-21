import { NextResponse } from "next/server";
import { appUrl, whoopConfigured } from "@/lib/wearables/oauth";

export async function GET() {
  if (!whoopConfigured()) {
    return NextResponse.json({ mode: "demo" });
  }
  const params = new URLSearchParams({
    client_id: process.env.WHOOP_CLIENT_ID ?? "",
    redirect_uri: `${appUrl()}/api/wearables/whoop/callback`,
    response_type: "code",
    scope: "read:recovery read:cycles read:sleep read:profile offline",
  });
  return NextResponse.json({
    mode: "live",
    url: `https://api.prod.whoop.com/oauth/oauth2/auth?${params.toString()}`,
  });
}
