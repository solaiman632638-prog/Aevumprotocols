import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** True once Supabase's public URL and key are set in the deployment. */
export const syncConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

/** Browser-only Supabase client, or null when accounts are not switched on. */
export function syncClient(): SupabaseClient | null {
  if (!syncConfigured || typeof window === "undefined") return null;
  client ??= createClient(url!, key!, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}
