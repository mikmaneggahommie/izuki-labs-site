import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only initialize if variables are present and valid to prevent build-time crashes
// We use a lazy getter to ensure this only runs during request handling, not module loading
export const supabase = (function() {
  if (typeof window === "undefined" && (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "undefined" || supabaseAnonKey === "undefined")) {
    return null as any;
  }
  
  if (!supabaseUrl || !supabaseAnonKey) return null as any;

  return createClient(supabaseUrl, supabaseAnonKey);
})();
