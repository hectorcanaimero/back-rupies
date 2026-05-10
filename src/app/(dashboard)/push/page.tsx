"use client";

import { useState } from "react";
import { z } from "zod";
import {
  Bell,
  Send,
  Users,
  User,
  Megaphone,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

type TargetType = "all" | "topic" | "token";
type SendStatus = "idle" | "sending" | "success" | "error";

interface SentNotification {
  id: string;
  title: string;
  body: string;
  target: string;
  sentAt: string;
  status: "success" | "error";
  messageId?: string;
}

interface Template {
  id: string;
  name: string;
  title: string;
  body: string;
  target: { type: TargetType; value: string };
}

// ─── Zod schema (client-side) ─────────────────────────────────────────────────

const FormSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(100),
  body: z.string().min(1, "Corpo obrigatório").max(300),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  dataJson: z.string().optional(),
  targetType: z.enum(["all", "topic", "token"]),
  targetValue: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

// ─── Mock templates ───────────────────────────────────────────────────────────

const INITIAL_TEMPLATES: Template[] = [
  {
    id: "1",
    name: "Novo Lead Disponível",
    title: "Novo lead disponível!",
    body: "Um novo lead foi publicado na sua categoria. Confira agora!",
    target: { type: "topic", value: "profissionais" },
  },
  {
    id: "2",
    name: "Créditos Esgotando",
    title: "Seus créditos estão acabando",
    body: "Você tem poucos créditos restantes. Renove seu plano para continuar.",
    target: { type: "topic", value: "empresas" },
  },
  {
    id: "3",
    name: "Manutenção Programada",
    title: "Manutenção programada",
    body: "O sistema ficará indisponível por 30 minutos nesta madrugada.",
    target: { type: "all", value: "all" },
  },
];

// ─── Mock history ─────────────────────────────────────────────────────────────

const INITIAL_HISTORY: SentNotification[] = [
  {
    id: "h1",
    title: "Boas-vindas à plataforma!",
    body: "Seja bem-vindo ao Rupies. Complete seu perfil para começar.",
    target: "Todos",
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "success",
    messageId: "projects/rupies-brasil/messages/abc123",
  },
  {
    id: "h2",
    title: "Promoção de fim de semana",
    body: "50% off no plano Pro por tempo limitado!",
    target: "Tópico: empresas",
    sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "success",
    messageId: "projects/rupies-brasil/messages/def456",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function targetLabel(type: TargetType, value: string): string {
  if (type === "all") return "Todos os usuários";
  if (type === "topic") {
    if (value === "empresas") return "Tópico: Empresas";
    if (value === "profissionais") return "Tópico: Profissionais";
    return `Tópico: ${value}`;
  }
  return `Token: ${value.slice(0, 20)}...`;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PushPage() {
  const [form, setForm] = useState<FormData>({
    title: "",
    body: "",
    imageUrl: "",
    dataJson: "",
    targetType: "all",
    targetValue: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [history, setHistory] = useState<SentNotification[]>(INITIAL_HISTORY);
  const [templates] = useState<Template[]>(INITIAL_TEMPLATES);

  // ── Field update helpers ──────────────────────────────────────────────────

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  // ── Apply template ────────────────────────────────────────────────────────

  function applyTemplate(template: Template) {
    setForm({
      title: template.title,
      body: template.body,
      imageUrl: "",
      dataJson: "",
      targetType: template.target.type,
      targetValue: template.target.value,
    });
    setErrors({});
    setSendStatus("idle");
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSend() {
    // Client-side validation
    const result = FormSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const [k, msgs] of Object.entries(result.error.flatten().fieldErrors)) {
        fieldErrors[k as keyof FormData] = msgs?.[0];
      }
      setErrors(fieldErrors);
      return;
    }

    // Build data payload from JSON string
    let dataPayload: Record<string, string> | undefined;
    if (form.dataJson?.trim()) {
      try {
        dataPayload = JSON.parse(form.dataJson);
      } catch {
        setErrors((prev) => ({ ...prev, dataJson: "JSON inválido" }));
        return;
      }
    }

    setSendStatus("sending");
    setErrorMessage("");

    const target =
      form.targetType === "all"
        ? { type: "all" as const, value: "all" }
        : { type: form.targetType, value: form.targetValue ?? "" };

    try {
      const res = await fetch("/api/firebase/fcm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          body: form.body,
          imageUrl: form.imageUrl || undefined,
          data: dataPayload,
          target,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Erro desconhecido");
      }

      setSendStatus("success");

      // Add to history
      const newEntry: SentNotification = {
        id: crypto.randomUUID(),
        title: form.title,
        body: form.body,
        target: targetLabel(form.targetType, form.targetValue ?? ""),
        sentAt: new Date().toISOString(),
        status: "success",
        messageId: json.messageId,
      };
      setHistory((prev) => [newEntry, ...prev]);

      // Reset form after 2s
      setTimeout(() => {
        setForm({
          title: "",
          body: "",
          imageUrl: "",
          dataJson: "",
          targetType: "all",
          targetValue: "",
        });
        setSendStatus("idle");
      }, 2000);
    } catch (err) {
      setSendStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Falha ao enviar");

      const newEntry: SentNotification = {
        id: crypto.randomUUID(),
        title: form.title,
        body: form.body,
        target: targetLabel(form.targetType, form.targetValue ?? ""),
        sentAt: new Date().toISOString(),
        status: "error",
      };
      setHistory((prev) => [newEntry, ...prev]);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const needsTokenInput = form.targetType === "token";
  const needsTopicInput = form.targetType === "topic";
  const isSending = sendStatus === "sending";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Push Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Envie notificações via Firebase Cloud Messaging
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Compose form (2/3 width) ── */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Compor Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="push-title">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="push-title"
                  placeholder="Ex: Novo lead disponível!"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  maxLength={100}
                  disabled={isSending}
                />
                <div className="flex justify-between">
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title}</p>
                  )}
                  <p className="ml-auto text-xs text-muted-foreground">
                    {form.title.length}/100
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-1.5">
                <Label htmlFor="push-body">
                  Corpo <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="push-body"
                  placeholder="Ex: Um novo lead foi publicado na sua categoria. Confira agora!"
                  value={form.body}
                  onChange={(e) => setField("body", e.target.value)}
                  maxLength={300}
                  rows={3}
                  disabled={isSending}
                />
                <div className="flex justify-between">
                  {errors.body && (
                    <p className="text-xs text-red-500">{errors.body}</p>
                  )}
                  <p className="ml-auto text-xs text-muted-foreground">
                    {form.body.length}/300
                  </p>
                </div>
              </div>

              {/* Image URL (optional) */}
              <div className="space-y-1.5">
                <Label htmlFor="push-image">Imagem (URL, opcional)</Label>
                <Input
                  id="push-image"
                  type="url"
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(e) => setField("imageUrl", e.target.value)}
                  disabled={isSending}
                />
                {errors.imageUrl && (
                  <p className="text-xs text-red-500">{errors.imageUrl}</p>
                )}
              </div>

              {/* Data payload (optional JSON) */}
              <div className="space-y-1.5">
                <Label htmlFor="push-data">
                  Data Payload{" "}
                  <span className="text-muted-foreground font-normal">
                    (JSON, opcional)
                  </span>
                </Label>
                <Textarea
                  id="push-data"
                  placeholder={'{ "screen": "leads", "id": "123" }'}
                  value={form.dataJson}
                  onChange={(e) => setField("dataJson", e.target.value)}
                  rows={2}
                  className="font-mono text-sm"
                  disabled={isSending}
                />
                {errors.dataJson && (
                  <p className="text-xs text-red-500">{errors.dataJson}</p>
                )}
              </div>

              {/* Target */}
              <div className="space-y-3">
                <Label>Destinatário</Label>
                <div className="flex gap-2">
                  <Select
                    value={form.targetType}
                    onValueChange={(v) => {
                      setField("targetType", v as TargetType);
                      setField("targetValue", "");
                    }}
                    disabled={isSending}
                  >
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <span className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          Todos os usuários
                        </span>
                      </SelectItem>
                      <SelectItem value="topic">
                        <span className="flex items-center gap-2">
                          <Megaphone className="h-3.5 w-3.5" />
                          Segmento (tópico)
                        </span>
                      </SelectItem>
                      <SelectItem value="token">
                        <span className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5" />
                          Usuário específico
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {needsTopicInput && (
                    <Select
                      value={form.targetValue}
                      onValueChange={(v) => setField("targetValue", v)}
                      disabled={isSending}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione o segmento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empresas">Empresas</SelectItem>
                        <SelectItem value="profissionais">
                          Profissionais
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {needsTokenInput && (
                  <div className="space-y-1.5">
                    <Input
                      placeholder="FCM device token ou email do usuário"
                      value={form.targetValue}
                      onChange={(e) => setField("targetValue", e.target.value)}
                      disabled={isSending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Cole o token FCM do dispositivo ou busque pelo email do
                      usuário
                    </p>
                  </div>
                )}
              </div>

              {/* Status feedback */}
              {sendStatus === "success" && (
                <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-500">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Notificação enviada com sucesso!
                </div>
              )}
              {sendStatus === "error" && (
                <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-500">
                  <XCircle className="h-4 w-4 shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* Send button */}
              <Button
                className="w-full"
                onClick={handleSend}
                disabled={isSending || sendStatus === "success"}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Notificação
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── Templates sidebar (1/3 width) ── */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Templates</CardTitle>
              <CardDescription>
                Clique para preencher o formulário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className="w-full text-left rounded-md border border-border p-3 hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                  disabled={isSending}
                >
                  <p className="text-sm font-medium leading-tight">{tpl.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {tpl.body}
                  </p>
                  <Badge variant="outline" className="mt-1.5 text-xs">
                    {targetLabel(tpl.target.type, tpl.target.value)}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── History ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Histórico de Envios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhuma notificação enviada ainda.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 py-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {item.status === "success" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.body}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.target}
                        </Badge>
                        {item.messageId && (
                          <span className="text-xs text-muted-foreground font-mono truncate max-w-48">
                            {item.messageId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(item.sentAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
