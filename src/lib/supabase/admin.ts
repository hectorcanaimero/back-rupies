import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// BACKOFFICE_READ_ONLY=true blocks every write to the apps' DB from the backoffice
const readOnlyFetch: typeof fetch = (input, init) => {
  const method = (init?.method ?? "GET").toUpperCase();
  if (process.env.BACKOFFICE_READ_ONLY === "true" && method !== "GET" && method !== "HEAD") {
    return Promise.resolve(
      Response.json({ message: "backoffice em modo somente leitura" }, { status: 403 })
    );
  }
  return fetch(input, init);
};

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: { fetch: readOnlyFetch },
    }
  );
}
