import { NextResponse } from "next/server";
import { createClient, type User } from "@supabase/supabase-js";

export const runtime = "nodejs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Emails allowed into /admin, from ADMIN_EMAILS (comma-separated). */
const admins = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export type Member = {
  id: string;
  name: string | null;
  email: string | null;
  joined: string;
  confirmed: boolean;
  lastSignIn: string | null;
  /** Signed up on Aevum, or has an Aevum profile. Other accounts came from the NovaEvum store. */
  aevum: boolean;
};

function member(user: User, aevumIds: Set<string>): Member {
  const name = user.user_metadata?.full_name;
  return {
    id: user.id,
    name: typeof name === "string" && name.trim() ? name.trim() : null,
    email: user.email ?? null,
    joined: user.created_at,
    confirmed: Boolean(user.email_confirmed_at),
    lastSignIn: user.last_sign_in_at ?? null,
    aevum: user.user_metadata?.signup_source === "aevum" || aevumIds.has(user.id),
  };
}

export async function GET(request: Request) {
  if (!url || !anonKey || !serviceKey || admins.size === 0) {
    return NextResponse.json({ error: "setup" }, { status: 503 });
  }

  // Who is asking: the signed-in user's own access token, checked by Supabase.
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "signed-out" }, { status: 401 });
  const { data: caller } = await createClient(url, anonKey).auth.getUser(token);
  const email = caller.user?.email?.toLowerCase();
  if (!email) return NextResponse.json({ error: "signed-out" }, { status: 401 });
  if (!admins.has(email)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // The service key bypasses row-level security, so it never leaves this route.
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const users: User[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }

  const { data: profiles } = await admin.from("aevum_profiles").select("user_id");
  const aevumIds = new Set((profiles ?? []).map((row: { user_id: string }) => row.user_id));

  const members = users
    .map((user) => member(user, aevumIds))
    .sort((a, b) => Date.parse(b.joined) - Date.parse(a.joined));

  return NextResponse.json({ members }, { headers: { "Cache-Control": "no-store" } });
}
