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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import type { TypeProvider } from "@/types/app";

const CATEGORIES = [
  "Produtos para comprar",
  "Produtos para Locação",
] as const;

const typeProviderSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  icon: z.string().url("URL de ícone inválida"),
  banner: z.string().url("URL de banner inválida").or(z.literal("")),
  url: z.string().url("URL inválida").or(z.literal("")),
  order: z.coerce.number().int().min(0, "Ordem deve ser positiva"),
  status: z.boolean(),
  category: z.string().min(1, "Categoria é obrigatória"),
});

type TypeProviderFormData = z.infer<typeof typeProviderSchema>;

interface TypeProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: TypeProvider | null;
  onSave: (data: TypeProviderFormData, id?: string) => Promise<void>;
}

async function uploadToStorage(file: File): Promise<string> {
  const supabase = createClient();
  const timestamp = Date.now() * 1000;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const filePath = `${timestamp}.${ext}`;

  const { error } = await supabase.storage
    .from("App")
    .upload(filePath, file, { upsert: true });

  if (error) throw new Error(error.message);

  const { data: publicUrl } = supabase.storage
    .from("App")
    .getPublicUrl(filePath);

  return publicUrl.publicUrl;
}

export function TypeProviderDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: TypeProviderDialogProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [banner, setBanner] = useState("");
  const [url, setUrl] = useState("");
  const [order, setOrder] = useState("0");
  const [status, setStatus] = useState(true);
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const isEditing = item != null;
  const uploading = uploadingIcon || uploadingBanner;

  useEffect(() => {
    if (open) {
      setName(item?.name ?? "");
      setIcon(item?.icon ?? "");
      setBanner(item?.banner ?? "");
      setUrl(item?.url ?? "");
      setOrder(String(item?.order ?? 0));
      setStatus(item?.status ?? true);
      setCategory(item?.category ?? CATEGORIES[0]);
      setErrors({});
    }
  }, [open, item]);

  async function handleIconUpload(file: File) {
    setUploadingIcon(true);
    setErrors((prev) => ({ ...prev, icon: "" }));
    try {
      const publicUrl = await uploadToStorage(file);
      setIcon(publicUrl);
    } catch (err) {
      setErrors((prev) => ({ ...prev, icon: `Erro: ${err instanceof Error ? err.message : "upload falhou"}` }));
    } finally {
      setUploadingIcon(false);
    }
  }

  async function handleBannerUpload(file: File) {
    setUploadingBanner(true);
    setErrors((prev) => ({ ...prev, banner: "" }));
    try {
      const publicUrl = await uploadToStorage(file);
      setBanner(publicUrl);
    } catch (err) {
      setErrors((prev) => ({ ...prev, banner: `Erro: ${err instanceof Error ? err.message : "upload falhou"}` }));
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleSubmit() {
    const result = typeProviderSchema.safeParse({
      name,
      icon,
      banner,
      url,
      order,
      status,
      category,
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
            {isEditing ? "Editar Tipo de Fornecedor" : "Novo Tipo de Fornecedor"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="tp-name">Nome</Label>
            <Input
              id="tp-name"
              placeholder="Ex: Fotógrafos"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Icon + Banner side by side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Icon */}
            <div className="space-y-1.5">
              <Label>Ícone</Label>
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleIconUpload(file);
                  e.target.value = "";
                }}
              />
              {icon ? (
                <div className="relative">
                  <img
                    src={icon}
                    alt="Ícone"
                    className="h-20 w-full rounded-lg object-cover border"
                  />
                  <div className="absolute top-1 right-1 flex gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => iconInputRef.current?.click()}
                      disabled={uploadingIcon}
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setIcon("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  disabled={uploadingIcon}
                  className="flex h-20 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
                >
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Upload className="h-5 w-5" />
                    <span className="text-xs">
                      {uploadingIcon ? "Enviando..." : "Ícone"}
                    </span>
                  </div>
                </button>
              )}
              {errors.icon && (
                <p className="text-xs text-destructive">{errors.icon}</p>
              )}
            </div>

            {/* Banner */}
            <div className="space-y-1.5">
              <Label>Banner</Label>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBannerUpload(file);
                  e.target.value = "";
                }}
              />
              {banner ? (
                <div className="relative">
                  <img
                    src={banner}
                    alt="Banner"
                    className="h-20 w-full rounded-lg object-cover border"
                  />
                  <div className="absolute top-1 right-1 flex gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => bannerInputRef.current?.click()}
                      disabled={uploadingBanner}
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setBanner("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadingBanner}
                  className="flex h-20 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
                >
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Upload className="h-5 w-5" />
                    <span className="text-xs">
                      {uploadingBanner ? "Enviando..." : "Banner"}
                    </span>
                  </div>
                </button>
              )}
              {errors.banner && (
                <p className="text-xs text-destructive">{errors.banner}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <Label htmlFor="tp-url">URL (opcional)</Label>
            <Input
              id="tp-url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url}</p>
            )}
          </div>

          {/* Order + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tp-order">Ordem</Label>
              <Input
                id="tp-order"
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
              <Switch id="tp-status" checked={status} onCheckedChange={setStatus} />
              <Label htmlFor="tp-status">Ativo</Label>
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
