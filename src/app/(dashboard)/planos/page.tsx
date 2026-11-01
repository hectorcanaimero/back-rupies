"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getPlanColumns } from "./columns";
import { PlanDialog } from "./plan-dialog";
import type { SubscriptionPlan } from "@/types/app";

export default function PlanosPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    createClient()
      .from("rp_subscription_plans")
      .select("*")
      .order("price_monthly", { ascending: true })
      .then(({ data }) => setPlans(data ?? []));
  }, []);

  const handleEdit = useCallback((plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(
    async (data: {
      name: string;
      description?: string;
      price_monthly: number;
      price_yearly: number;
      credits_per_month?: number;
      is_unlimited: boolean;
      is_free: boolean;
      active: boolean;
      plan_type: string;
      features?: string;
    }, id?: string) => {
      const payload = {
        name: data.name,
        description: data.description ?? null,
        price_monthly: data.price_monthly,
        price_yearly: data.price_yearly,
        credits_per_month: data.credits_per_month ?? 0,
        is_unlimited: data.is_unlimited,
        is_free: data.is_free,
        active: data.active,
        plan_type: data.plan_type,
      };
      const db = createClient().from("rp_subscription_plans");
      const { data: saved, error } = id
        ? await db.update(payload).eq("id", id).select().single()
        : await db.insert(payload).select().single();
      if (error) return alert(`Erro ao salvar: ${error.message}`);
      setPlans((prev) => (id ? prev.map((p) => (p.id === id ? saved : p)) : [...prev, saved]));
    },
    []
  );

  const columns = getPlanColumns({ onEdit: handleEdit });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planos</h1>
          <p className="text-sm text-muted-foreground">{plans.length} registros</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingPlan(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Novo Plano
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={plans}
        searchKey="name"
        searchPlaceholder="Buscar por nome..."
      />
      <PlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plan={editingPlan}
        onSave={handleSave}
      />
    </div>
  );
}
