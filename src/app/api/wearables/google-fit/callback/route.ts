import { NextResponse } from "next/server";
import { appUrl, GOOGLE_TOKEN } from "@/lib/wearables/oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirect = NextResponse.redirect(new URL("/monitor?connected=google-fit", appUrl()));

  if (!code || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/monitor?connected=demo", appUrl()));
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: `${appUrl()}/api/wearables/google-fit/callback`,
  });

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL("/monitor?connected=error", appUrl()));
  }

  const payload = (await tokenResponse.json()) as { access_token?: string };
  if (payload.access_token) {
    redirect.cookies.set(GOOGLE_TOKEN, payload.access_token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return redirect;
}
