"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Schema = z.object({
  title: z.string().min(1, "Título obrigatório").max(200),
  body: z.string().min(1, "Corpo obrigatório").max(500),
  userId: z
    .string()
    .uuid("UUID inválido")
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof Schema>;

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { title: string; body: string; userId?: string }) => Promise<void>;
}

export function NotificationDialog({
  open,
  onOpenChange,
  onSave,
}: NotificationDialogProps) {
  const [form, setForm] = useState<FormData>({ title: "", body: "", userId: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving, setSaving] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setForm({ title: "", body: "", userId: "" });
      setErrors({});
    }
  }, [open]);

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit() {
    const result = Schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const [k, msgs] of Object.entries(result.error.flatten().fieldErrors)) {
        fieldErrors[k as keyof FormData] = msgs?.[0];
      }
      setErrors(fieldErrors);
      return;
    }
    setSaving(true);
    try {
      await onSave({
        title: form.title,
        body: form.body,
        userId: form.userId || undefined,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Notificação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="notif-title">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="notif-title"
              placeholder="Ex: Sua candidatura foi aprovada"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              maxLength={200}
              disabled={saving}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notif-body">
              Corpo <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="notif-body"
              placeholder="Ex: Você foi selecionado para o serviço #123."
              value={form.body}
              onChange={(e) => setField("body", e.target.value)}
              maxLength={500}
              rows={3}
              disabled={saving}
            />
            {errors.body && (
              <p className="text-xs text-red-500">{errors.body}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notif-user">
              Destinatário{" "}
              <span className="text-muted-foreground font-normal">(UUID, deixe vazio para todos)</span>
            </Label>
            <Input
              id="notif-user"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={form.userId}
              onChange={(e) => setField("userId", e.target.value)}
              className="font-mono text-sm"
              disabled={saving}
            />
            {errors.userId && (
              <p className="text-xs text-red-500">{errors.userId}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Salvando..." : "Criar Notificação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
