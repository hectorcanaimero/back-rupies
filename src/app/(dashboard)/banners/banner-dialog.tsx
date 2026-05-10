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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Banner } from "@/types/app";

const bannerSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  image_url: z.string().url("URL de imagem inválida").or(z.literal("")),
  link: z.string().url("Link inválido").or(z.literal("")),
  order: z.coerce.number().int().min(0, "Ordem deve ser positiva"),
  type: z.enum(["banner", "external"]),
  active: z.boolean(),
});

type BannerFormData = z.infer<typeof bannerSchema>;

interface BannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: Banner | null;
  onSave: (data: BannerFormData, id?: string) => Promise<void>;
}

export function BannerDialog({
  open,
  onOpenChange,
  banner,
  onSave,
}: BannerDialogProps) {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [order, setOrder] = useState("0");
  const [type, setType] = useState<"banner" | "external">("banner");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isEditing = banner != null;

  useEffect(() => {
    if (open) {
      setTitle(banner?.title ?? "");
      setImageUrl(banner?.image_url ?? "");
      setLink(banner?.link ?? "");
      setOrder(String(banner?.order ?? 0));
      setType((banner?.type as "banner" | "external") ?? "banner");
      setActive(banner?.active ?? true);
      setErrors({});
    }
  }, [open, banner]);

  async function handleSubmit() {
    const result = bannerSchema.safeParse({
      title,
      image_url: imageUrl,
      link,
      order,
      type,
      active,
    });
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
      await onSave(result.data, banner?.id);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Banner" : "Novo Banner"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="ban-title">Título</Label>
            <Input
              id="ban-title"
              placeholder="Ex: Promoção de Verão"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ban-image">URL da Imagem</Label>
            <Input
              id="ban-image"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {errors.image_url && (
              <p className="text-xs text-destructive">{errors.image_url}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ban-link">Link</Label>
            <Input
              id="ban-link"
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            {errors.link && (
              <p className="text-xs text-destructive">{errors.link}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ban-order">Ordem</Label>
              <Input
                id="ban-order"
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
              {errors.order && (
                <p className="text-xs text-destructive">{errors.order}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as "banner" | "external")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="external">Externo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="ban-active" checked={active} onCheckedChange={setActive} />
            <Label htmlFor="ban-active">Ativo</Label>
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
