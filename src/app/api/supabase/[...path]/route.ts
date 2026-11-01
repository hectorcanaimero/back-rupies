import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/supabase/middleware";

// Server-side proxy for the browser Supabase client (see lib/supabase/client.ts).
// The apps' DB has RLS with no backoffice policies, so browser queries are
// forwarded here and executed with the service role after checking the admin.

const ALLOWED_PREFIXES = ["rest/v1/", "storage/v1/"];
const FORWARD_REQUEST_HEADERS = [
  "accept",
  "accept-profile",
  "content-profile",
  "content-type",
  "prefer",
  "range",
  "x-upsert",
  "cache-control",
];
const FORWARD_RESPONSE_HEADERS = ["content-type", "content-range", "preference-applied", "location"];

async function handler(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return Response.json({ message: "unauthorized" }, { status: 401 });
  }

  const path = (await ctx.params).path.join("/");
  if (!ALLOWED_PREFIXES.some((p) => path.startsWith(p))) {
    return Response.json({ message: "forbidden path" }, { status: 403 });
  }

  const isRead = request.method === "GET" || request.method === "HEAD";
  if (!isRead && process.env.BACKOFFICE_READ_ONLY === "true") {
    return Response.json({ message: "backoffice em modo somente leitura" }, { status: 403 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const headers = new Headers({ apikey: serviceKey, Authorization: `Bearer ${serviceKey}` });
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const upstream = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/${path}${request.nextUrl.search}`,
    {
      method: request.method,
      headers,
      body: isRead ? undefined : await request.arrayBuffer(),
    }
  );

  const responseHeaders = new Headers();
  for (const name of FORWARD_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export { handler as GET, handler as HEAD, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };
