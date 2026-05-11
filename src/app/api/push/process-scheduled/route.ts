import { createAdminClient } from "@/lib/supabase/admin";

// ─── POST /api/push/process-scheduled ────────────────────────────────────────

export async function POST(request: Request) {
  // Auth check
  const webhookSecret = request.headers.get("x-webhook-secret");
  if (!webhookSecret || webhookSecret !== process.env.WEBHOOK_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Fetch pending scheduled pushes (status = 'sent' but not yet dispatched)
  const { data: pushes, error: fetchError } = await supabase
    .from("scheduled_pushes")
    .select("*")
    .eq("status", "sent")
    .is("sent_at", null)
    .limit(50);

  if (fetchError) {
    return Response.json({ error: fetchError.message }, { status: 500 });
  }

  if (!pushes || pushes.length === 0) {
    return Response.json({ processed: 0 });
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let processed = 0;

  for (const push of pushes) {
    // Build target object
    let target: Record<string, unknown>;

    if (push.target_type === "users") {
      const targetUsers = (push.target_users ?? []) as Array<{
        id: string;
        fcmToken: string;
      }>;
      target = {
        type: "users",
        tokens: targetUsers.map((u) => u.fcmToken),
      };
    } else if (push.target_type === "all") {
      target = { type: "all", value: "all" };
    } else {
      target = { type: push.target_type, value: push.target_value };
    }

    try {
      const fcmRes = await fetch(`${appUrl}/api/firebase/fcm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: push.title,
          body: push.body,
          ...(push.image_url ? { imageUrl: push.image_url } : {}),
          ...(push.data_payload ? { data: push.data_payload } : {}),
          target,
        }),
      });

      if (!fcmRes.ok) {
        const errBody = await fcmRes.text();
        await supabase
          .from("scheduled_pushes")
          .update({ status: "failed", error_message: errBody })
          .eq("id", push.id);
        continue;
      }

      // Mark as dispatched
      await supabase
        .from("scheduled_pushes")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", push.id);

      processed++;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      await supabase
        .from("scheduled_pushes")
        .update({ status: "failed", error_message: message })
        .eq("id", push.id);
    }
  }

  return Response.json({ processed });
}
