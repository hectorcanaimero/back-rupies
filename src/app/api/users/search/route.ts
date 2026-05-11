import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  if (q.length < 2) {
    return Response.json({ users: [] });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, email, display_name, photo_url, fcm_token")
    .not("fcm_token", "is", null)
    .or(`display_name.ilike.%${q}%,email.ilike.%${q}%`)
    .limit(20);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const users = (data ?? []).map((u) => ({
    id: u.id,
    displayName: u.display_name,
    email: u.email,
    photoUrl: u.photo_url,
    fcmToken: u.fcm_token,
  }));

  return Response.json({ users });
}
