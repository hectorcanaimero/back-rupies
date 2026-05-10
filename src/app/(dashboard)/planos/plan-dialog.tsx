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
import type { SubscriptionPlan } from "@/types/app";

const planSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  price_monthly: z.coerce.number().min(0, "Preço deve ser positivo"),
  price_yearly: z.coerce.number().min(0, "Preço deve ser positivo"),
  credits_per_month: z.coerce.number().int().min(0).optional(),
  is_unlimited: z.boolean(),
  is_free: z.boolean(),
  is_active: z.boolean(),
  type: z.string().min(1, "Tipo é obrigatório"),
  sort_order: z.coerce.number().int().min(0),
  features: z.string().optional(),
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: SubscriptionPlan | null;
  onSave: (data: PlanFormData, id?: string) => Promise<void>;
}

export function PlanDialog({ open, onOpenChange, plan, onSave }: PlanDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceMonthly, setPriceMonthly] = useState("0");
  const [priceYearly, setPriceYearly] = useState("0");
  const [creditsPerMonth, setCreditsPerMonth] = useState("0");
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [type, setType] = useState("empresa");
  const [sortOrder, setSortOrder] = useState("0");
  const [features, setFeatures] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isEditing = plan != null;

  useEffect(() => {
    if (open) {
      setName(plan?.name ?? "");
      setDescription(plan?.description ?? "");
      setPriceMonthly(String(plan?.price_monthly ?? 0));
      setPriceYearly(String(plan?.price_yearly ?? 0));
      setCreditsPerMonth(String(plan?.credits_per_month ?? 0));
      setIsUnlimited(plan?.is_unlimited ?? false);
      setIsFree(plan?.is_free ?? false);
      setIsActive(plan?.is_active ?? true);
      setType(plan?.type ?? plan?.plan_type ?? "empresa");
      setSortOrder(String(plan?.sort_order ?? 0));
      setFeatures("");
      setErrors({});
    }
  }, [open, plan]);

  async function handleSubmit() {
    const result = planSchema.safeParse({
      name,
      description,
      price_monthly: priceMonthly,
      price_yearly: priceYearly,
      credits_per_month: creditsPerMonth,
      is_unlimited: isUnlimited,
      is_free: isFree,
      is_active: isActive,
      type,
      sort_order: sortOrder,
      features,
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
      await onSave(result.data, plan?.id);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Plano" : "Novo Plano"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <label htmlFor="plan-name" className="text-sm font-medium leading-none">
              Nome
            </label>
            <Input
              id="plan-name"
              placeholder="Ex: Pro Mensal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="plan-desc" className="text-sm font-medium leading-none">
              Descrição
            </label>
            <Input
              id="plan-desc"
              placeholder="Descrição breve do plano"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="plan-monthly" className="text-sm font-medium leading-none">
                Preço Mensal (R$)
              </label>
              <Input
                id="plan-monthly"
                type="number"
                min="0"
                step="0.01"
                value={priceMonthly}
                onChange={(e) => setPriceMonthly(e.target.value)}
              />
              {errors.price_monthly && (
                <p className="text-xs text-destructive">{errors.price_monthly}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="plan-yearly" className="text-sm font-medium leading-none">
                Preço Anual (R$)
              </label>
              <Input
                id="plan-yearly"
                type="number"
                min="0"
                step="0.01"
                value={priceYearly}
                onChange={(e) => setPriceYearly(e.target.value)}
              />
              {errors.price_yearly && (
                <p className="text-xs text-destructive">{errors.price_yearly}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="plan-credits" className="text-sm font-medium leading-none">
                Créditos/mês
              </label>
              <Input
                id="plan-credits"
                type="number"
                min="0"
                value={creditsPerMonth}
                onChange={(e) => setCreditsPerMonth(e.target.value)}
                disabled={isUnlimited}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="plan-type" className="text-sm font-medium leading-none">
                Tipo
              </label>
              <Input
                id="plan-type"
                placeholder="Ex: empresa, profissional"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
              {errors.type && (
                <p className="text-xs text-destructive">{errors.type}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="plan-order" className="text-sm font-medium leading-none">
              Ordem de exibição
            </label>
            <Input
              id="plan-order"
              type="number"
              min="0"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="plan-features" className="text-sm font-medium leading-none">
              Features{" "}
              <span className="text-xs text-muted-foreground font-normal">(JSON, opcional)</span>
            </label>
            <textarea
              id="plan-features"
              placeholder='Ex: {"max_services": 10, "analytics": true}'
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isUnlimited}
                onChange={(e) => setIsUnlimited(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span className="text-sm font-medium">Créditos ilimitados</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span className="text-sm font-medium">Plano gratuito</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span className="text-sm font-medium">Ativo</span>
            </label>
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
