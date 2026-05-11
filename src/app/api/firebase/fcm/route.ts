// src/app/api/firebase/fcm/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import type { Notification } from "firebase-admin/messaging";

// Lazy import so the module doesn't crash if firebase-admin isn't installed yet
async function getMessaging() {
  const { messaging } = await import("@/lib/firebase/admin");
  return messaging;
}

// ─── Validation schema ────────────────────────────────────────────────────────

const FcmTargetSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("topic"), value: z.string().min(1) }),
  z.object({ type: z.literal("token"), value: z.string().min(1) }),
  z.object({ type: z.literal("all"), value: z.string().default("all") }),
  z.object({ type: z.literal("users"), tokens: z.array(z.string().min(1)).min(1) }),
]);

const FcmBodySchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  body: z.string().min(1, "Corpo obrigatório"),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  data: z.record(z.string()).optional(),
  target: FcmTargetSchema,
});

// ─── POST /api/firebase/fcm ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = FcmBodySchema.safeParse(json);

    if (!parsed.success) {
      return Response.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, body, imageUrl, data, target } = parsed.data;

    // Build the FCM message base
    const notification: Notification = {
      title,
      body,
      ...(imageUrl ? { imageUrl } : {}),
    };

    const messaging = await getMessaging();

    if (target.type === "users") {
      const response = await messaging.sendEachForMulticast({
        tokens: target.tokens,
        notification,
        data: data ?? {},
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } },
      });

      return Response.json({
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        sentAt: new Date().toISOString(),
      });
    }

    let messageId: string;

    if (target.type === "token") {
      // Send to specific device token
      messageId = await messaging.send({
        token: target.value,
        notification,
        data: data ?? {},
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } },
      });
    } else {
      // topic: "all", "empresas", "profissionais", or any custom topic
      const topic =
        target.type === "all" ? "all" : target.value;

      messageId = await messaging.send({
        topic,
        notification,
        data: data ?? {},
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } },
      });
    }

    return Response.json({
      success: true,
      messageId,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[FCM] Send error:", message);
    return Response.json(
      { error: "Falha ao enviar notificação", detail: message },
      { status: 500 }
    );
  }
}
