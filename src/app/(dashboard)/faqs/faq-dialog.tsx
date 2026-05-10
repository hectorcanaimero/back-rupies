"use client";

import { useState, useEffect } from "react";
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
import type { Sac } from "@/types/app";

const faqSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  order: z.coerce.number().int().min(0, "Ordem deve ser positiva"),
});

type FaqFormData = z.infer<typeof faqSchema>;

interface FaqDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq?: Sac | null;
  onSave: (data: FaqFormData, id?: string) => Promise<void>;
}

export function FaqDialog({ open, onOpenChange, faq, onSave }: FaqDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState("0");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isEditing = faq != null;

  useEffect(() => {
    if (open) {
      setTitle(faq?.title ?? "");
      setContent(faq?.content ?? "");
      setOrder(String(faq?.order ?? 0));
      setErrors({});
    }
  }, [open, faq]);

  async function handleSubmit() {
    const result = faqSchema.safeParse({ title, content, order });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        if (e.path[0]) fieldErrors[String(e.path[0])] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setSaving(true);
    try {
      await onSave(result.data, faq?.id);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar FAQ" : "Novo FAQ"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label htmlFor="faq-title" className="text-sm font-medium leading-none">Título / Pergunta</label>
            <Input
              id="faq-title"
              placeholder="Ex: Como cancelar minha assinatura?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="faq-content" className="text-sm font-medium leading-none">Resposta</label>
            <textarea
              id="faq-content"
              placeholder="Descreva a resposta..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            {errors.content && (
              <p className="text-xs text-destructive">{errors.content}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="faq-order" className="text-sm font-medium leading-none">Ordem</label>
            <Input
              id="faq-order"
              type="number"
              min="0"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
            {errors.order && (
              <p className="text-xs text-destructive">{errors.order}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
