import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _initialized = false;

/** Lazy Supabase client — only created on first access, never at build time. */
export function getSupabase(): SupabaseClient | null {
  if (_initialized) return _client;
  _initialized = true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === "undefined" || key === "undefined") {
    _client = null;
    return null;
  }

  _client = createClient(url, key);
  return _client;
}

/** @deprecated Use getSupabase() instead */
export const supabase = null;
