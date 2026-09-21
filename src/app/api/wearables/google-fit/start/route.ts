import { NextResponse } from "next/server";
import { appUrl, googleConfigured } from "@/lib/wearables/oauth";

export async function GET() {
  if (!googleConfigured()) {
    return NextResponse.json({ mode: "demo" });
  }
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: `${appUrl()}/api/wearables/google-fit/callback`,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/fitness.heart_rate.read",
      "https://www.googleapis.com/auth/fitness.sleep.read",
    ].join(" "),
  });
  return NextResponse.json({
    mode: "live",
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  });
}
