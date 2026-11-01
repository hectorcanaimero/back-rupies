import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PROXIED = [`${SUPABASE_URL}/rest/v1/`, `${SUPABASE_URL}/storage/v1/`];

// Data and storage calls go through /api/supabase (service role, admin-checked);
// auth calls go straight to Supabase.
const proxyFetch: typeof fetch = (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : null;
  if (url && PROXIED.some((p) => url.startsWith(p))) {
    return fetch(`/api/supabase/${url.slice(SUPABASE_URL.length + 1)}`, init);
  }
  return fetch(input, init);
};

// @supabase/ssr 0.5 predates the generated types' PostgrestVersion and types writes as never
export function createClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { fetch: proxyFetch },
  }) as unknown as SupabaseClient<Database>;
}
