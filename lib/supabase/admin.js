import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY. Uses the secret key which bypasses RLS.
// Never import this file into a Client Component or expose it to the browser.
// Use only for: platform-admin operations, trusted server-side jobs
// (e.g. invoice numbering transactions, PDF storage writes).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
