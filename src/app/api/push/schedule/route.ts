import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const scheduleSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  imageUrl: z.union([z.string().url(), z.literal("")]).optional(),
  dataPayload: z.record(z.string(), z.string()).optional(),
  targetType: z.enum(["all", "topic", "token", "users"]),
  targetValue: z.string().optional(),
  targetUsers: z
    .array(z.object({ id: z.string(), fcmToken: z.string() }))
    .optional(),
  scheduledAt: z.string().datetime(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = scheduleSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const {
    title,
    body: msgBody,
    imageUrl,
    dataPayload,
    targetType,
    targetValue,
    targetUsers,
    scheduledAt,
  } = parsed.data;

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("scheduled_pushes")
    .insert({
      title,
      body: msgBody,
      image_url: imageUrl ?? null,
      data_payload: dataPayload ?? null,
      target_type: targetType,
      target_value: targetValue ?? null,
      target_users: targetUsers ?? null,
      scheduled_at: scheduledAt,
    })
    .select("id, scheduled_at")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    success: true,
    id: data.id,
    scheduledAt: data.scheduled_at,
  });
}
