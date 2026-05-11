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
import type { Provider, TypeProvider } from "@/types/app";

const SELECT_OPTIONS = [
  { value: "first", label: "1º Posição" },
  { value: "second", label: "2º Posição" },
  { value: "third", label: "3º Posição" },
] as const;

const optionalUrl = z.string().url().or(z.literal(""));

const providerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  logo: z.string().url("URL de logo inválida").or(z.literal("")),
  banner: z.string().url("URL de banner inválida").or(z.literal("")),
  wa: optionalUrl,
  ig: optionalUrl,
  fb: optionalUrl,
  web: optionalUrl,
  phone: z.string(),
  email: z.string().email("Email inválido").or(z.literal("")),
  order: z.coerce.number().int().min(0, "Ordem deve ser positiva"),
  status: z.boolean(),
  select: z.string(),
});

type ProviderFormData = z.infer<typeof providerSchema>;

interface ProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Provider | null;
  onSave: (data: ProviderFormData, id?: string) => Promise<void>;
  types: TypeProvider[];
}

async function uploadToStorage(file: File): Promise<string> {
  const supabase = createClient();
  const timestamp = Date.now() * 1000;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const filePath = `${timestamp}.${ext}`;

  const { error } = await supabase.storage
    .from("Fornecedores")
    .upload(filePath, file, { upsert: true });

  if (error) throw new Error(error.message);

  const { data: publicUrl } = supabase.storage
    .from("Fornecedores")
    .getPublicUrl(filePath);

  return publicUrl.publicUrl;
}

export function ProviderDialog({
  open,
  onOpenChange,
  item,
  onSave,
  types,
}: ProviderDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [wa, setWa] = useState("");
  const [ig, setIg] = useState("");
  const [fb, setFb] = useState("");
  const [web, setWeb] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState("0");
  const [status, setStatus] = useState(true);
  const [selectPos, setSelectPos] = useState("second");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const isEditing = item != null;
  const uploading = uploadingLogo || uploadingBanner;

  useEffect(() => {
    if (open) {
      setName(item?.name ?? "");
      setType(item?.type ?? "");
      setLogo(item?.logo ?? "");
      setBanner(item?.banner ?? "");
      setWa(item?.wa ?? "");
      setIg(item?.ig ?? "");
      setFb(item?.fb ?? "");
      setWeb(item?.web ?? "");
      setPhone(item?.phone ?? "");
      setEmail(item?.email ?? "");
      setOrder(String(item?.order ?? 0));
      setStatus(item?.status ?? true);
      setSelectPos(item?.select ?? "second");
      setErrors({});
    }
  }, [open, item]);

  async function handleLogoUpload(file: File) {
    setUploadingLogo(true);
    setErrors((prev) => ({ ...prev, logo: "" }));
    try {
      setLogo(await uploadToStorage(file));
    } catch (err) {
      setErrors((prev) => ({ ...prev, logo: `Erro: ${err instanceof Error ? err.message : "upload falhou"}` }));
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleBannerUpload(file: File) {
    setUploadingBanner(true);
    setErrors((prev) => ({ ...prev, banner: "" }));
    try {
      setBanner(await uploadToStorage(file));
    } catch (err) {
      setErrors((prev) => ({ ...prev, banner: `Erro: ${err instanceof Error ? err.message : "upload falhou"}` }));
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleSubmit() {
    const result = providerSchema.safeParse({
      name,
      type,
      logo,
      banner,
      wa,
      ig,
      fb,
      web,
      phone,
      email,
      order,
      status,
      select: selectPos,
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

  function renderImageUpload(
    label: string,
    value: string,
    setValue: (v: string) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
    onUpload: (f: File) => void,
    isUploading: boolean,
    errorKey: string
  ) {
    return (
      <div className="space-y-1.5">
        <Label>{label}</Label>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt={label}
              className="h-20 w-full rounded-lg object-cover border"
            />
            <div className="absolute top-1 right-1 flex gap-1">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-6 w-6"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-6 w-6"
                onClick={() => setValue("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex h-20 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
          >
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Upload className="h-5 w-5" />
              <span className="text-xs">
                {isUploading ? "Enviando..." : label}
              </span>
            </div>
          </button>
        )}
        {errors[errorKey] && (
          <p className="text-xs text-destructive">{errors[errorKey]}</p>
        )}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Fornecedor" : "Novo Fornecedor"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="pv-name">Nome</Label>
            <Input
              id="pv-name"
              placeholder="Ex: HPM Brindes"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Type + Select */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Posição</Label>
              <Select value={selectPos} onValueChange={setSelectPos}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SELECT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Logo + Banner */}
          <div className="grid grid-cols-2 gap-4">
            {renderImageUpload("Logo", logo, setLogo, logoInputRef, handleLogoUpload, uploadingLogo, "logo")}
            {renderImageUpload("Banner", banner, setBanner, bannerInputRef, handleBannerUpload, uploadingBanner, "banner")}
          </div>

          {/* Social links */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Redes sociais</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="pv-wa" className="text-xs">WhatsApp</Label>
                <Input id="pv-wa" placeholder="https://wa.me/..." value={wa} onChange={(e) => setWa(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pv-ig" className="text-xs">Instagram</Label>
                <Input id="pv-ig" placeholder="https://instagram.com/..." value={ig} onChange={(e) => setIg(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pv-fb" className="text-xs">Facebook</Label>
                <Input id="pv-fb" placeholder="https://facebook.com/..." value={fb} onChange={(e) => setFb(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pv-web" className="text-xs">Website</Label>
                <Input id="pv-web" placeholder="https://..." value={web} onChange={(e) => setWeb(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pv-phone" className="text-xs">Telefone</Label>
                <Input id="pv-phone" placeholder="11999999999" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pv-email" className="text-xs">Email</Label>
                <Input id="pv-email" placeholder="contato@..." value={email} onChange={(e) => setEmail(e.target.value)} />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Order + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pv-order">Ordem</Label>
              <Input
                id="pv-order"
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
              {errors.order && <p className="text-xs text-destructive">{errors.order}</p>}
            </div>
            <div className="flex items-end pb-1 gap-3">
              <Switch id="pv-status" checked={status} onCheckedChange={setStatus} />
              <Label htmlFor="pv-status">Ativo</Label>
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
