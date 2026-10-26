import { createHash, randomBytes } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Server-only client that bypasses row-level security, or null before setup. */
export function serviceClient(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** The signed-in user behind a browser's Bearer token, checked by Supabase. */
export async function callerId(request: Request): Promise<string | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!url || !anonKey || !token) return null;
  const { data } = await createClient(url, anonKey).auth.getUser(token);
  return data.user?.id ?? null;
}

export function newHealthKey(): string {
  return `aevum_hk_${randomBytes(24).toString("base64url")}`;
}

export function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
