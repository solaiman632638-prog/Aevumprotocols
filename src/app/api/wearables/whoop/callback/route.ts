import { NextResponse } from "next/server";
import { appUrl, WHOOP_TOKEN } from "@/lib/wearables/oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirect = NextResponse.redirect(new URL("/monitor?connected=whoop", appUrl()));

  if (!code || !process.env.WHOOP_CLIENT_ID || !process.env.WHOOP_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/monitor?connected=demo", appUrl()));
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: process.env.WHOOP_CLIENT_ID,
    client_secret: process.env.WHOOP_CLIENT_SECRET,
    redirect_uri: `${appUrl()}/api/wearables/whoop/callback`,
  });

  const tokenResponse = await fetch("https://api.prod.whoop.com/oauth/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL("/monitor?connected=error", appUrl()));
  }

  const payload = (await tokenResponse.json()) as { access_token?: string };
  if (payload.access_token) {
    redirect.cookies.set(WHOOP_TOKEN, payload.access_token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return redirect;
}
