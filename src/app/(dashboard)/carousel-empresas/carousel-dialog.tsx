"use client";

import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
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
import { Upload, X } from "lucide-react";
import type { ExternalBanner } from "@/types/app";

const carouselSchema = z.object({
  image: z.string().url("URL de imagem inválida"),
  url: z.string().url("URL inválida").or(z.literal("")),
  text_button: z.string().min(1, "Texto do botão é obrigatório"),
  color_button: z.string().min(1, "Cor do botão é obrigatória"),
  color_text: z.string().min(1, "Cor do texto é obrigatória"),
  order: z.coerce.number().int().min(0, "Ordem deve ser positiva"),
  status: z.boolean(),
  start: z.string().nullable(),
  end: z.string().nullable(),
});

type CarouselFormData = z.infer<typeof carouselSchema>;

interface CarouselDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ExternalBanner | null;
  onSave: (data: CarouselFormData, id?: string) => Promise<void>;
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function CarouselDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: CarouselDialogProps) {
  const [image, setImage] = useState("");
  const [url, setUrl] = useState("");
  const [textButton, setTextButton] = useState("");
  const [colorButton, setColorButton] = useState("#000000");
  const [colorText, setColorText] = useState("#ffffff");
  const [order, setOrder] = useState("0");
  const [status, setStatus] = useState(true);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = item != null;

  useEffect(() => {
    if (open) {
      setImage(item?.image ?? "");
      setUrl(item?.url ?? "");
      setTextButton(item?.text_button ?? "");
      setColorButton(item?.color_button ?? "#000000");
      setColorText(item?.color_text ?? "#ffffff");
      setOrder(String(item?.order ?? 0));
      setStatus(item?.status ?? true);
      setStart(toDatetimeLocal(item?.start));
      setEnd(toDatetimeLocal(item?.end));
      setErrors({});
    }
  }, [open, item]);

  async function handleFileUpload(file: File) {
    setUploading(true);
    setErrors((prev) => ({ ...prev, image: "" }));
    try {
      const supabase = createClient();
      const timestamp = Date.now() * 1000;
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const filePath = `${timestamp}.${ext}`;

      const { error } = await supabase.storage
        .from("App")
        .upload(filePath, file, { upsert: true });

      if (error) {
        setErrors((prev) => ({ ...prev, image: `Erro no upload: ${error.message}` }));
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("App")
        .getPublicUrl(filePath);

      setImage(publicUrl.publicUrl);
    } catch {
      setErrors((prev) => ({ ...prev, image: "Erro ao fazer upload da imagem" }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    const result = carouselSchema.safeParse({
      image,
      url,
      text_button: textButton,
      color_button: colorButton,
      color_text: colorText,
      order,
      status,
      start: fromDatetimeLocal(start),
      end: fromDatetimeLocal(end),
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
      await onSave(result.data, item?.id);
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
            {isEditing ? "Editar Carousel" : "Novo Carousel"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Image upload */}
          <div className="space-y-1.5">
            <Label>Imagem</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = "";
              }}
            />
            {image ? (
              <div className="relative">
                <img
                  src={image}
                  alt="Preview"
                  className="h-32 w-full rounded object-cover border"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setImage("")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex h-32 w-full items-center justify-center rounded border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
              >
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">
                    {uploading ? "Enviando..." : "Clique para enviar imagem"}
                  </span>
                </div>
              </button>
            )}
            {errors.image && (
              <p className="text-xs text-destructive">{errors.image}</p>
            )}
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <Label htmlFor="car-url">URL de destino</Label>
            <Input
              id="car-url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url}</p>
            )}
          </div>

          {/* Button text + colors */}
          <div className="space-y-1.5">
            <Label htmlFor="car-text">Texto do botão</Label>
            <Input
              id="car-text"
              placeholder="Ex: Saiba Mais"
              value={textButton}
              onChange={(e) => setTextButton(e.target.value)}
            />
            {errors.text_button && (
              <p className="text-xs text-destructive">{errors.text_button}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="car-color-btn">Cor do botão</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="car-color-btn"
                  value={colorButton}
                  onChange={(e) => setColorButton(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border border-input p-0.5"
                />
                <Input
                  value={colorButton}
                  onChange={(e) => setColorButton(e.target.value)}
                  className="flex-1 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="car-color-text">Cor do texto</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="car-color-text"
                  value={colorText}
                  onChange={(e) => setColorText(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border border-input p-0.5"
                />
                <Input
                  value={colorText}
                  onChange={(e) => setColorText(e.target.value)}
                  className="flex-1 font-mono text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {textButton && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Preview do botão</Label>
              <div>
                <span
                  className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold"
                  style={{ backgroundColor: colorButton, color: colorText }}
                >
                  {textButton}
                </span>
              </div>
            </div>
          )}

          {/* Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="car-order">Ordem</Label>
              <Input
                id="car-order"
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
              {errors.order && (
                <p className="text-xs text-destructive">{errors.order}</p>
              )}
            </div>
            <div className="flex items-end pb-1 gap-3">
              <Switch id="car-status" checked={status} onCheckedChange={setStatus} />
              <Label htmlFor="car-status">Ativo</Label>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="car-start">Data início</Label>
              <Input
                id="car-start"
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="car-end">Data fim</Label>
              <Input
                id="car-end"
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || uploading}>
            {saving ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
