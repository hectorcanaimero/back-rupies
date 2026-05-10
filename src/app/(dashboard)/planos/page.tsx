"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getPlanColumns } from "./columns";
import { PlanDialog } from "./plan-dialog";
import type { SubscriptionPlan } from "@/types/app";

const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: "1",
    name: "Grátis",
    description: "Plano básico gratuito",
    price_monthly: 0,
    price_yearly: 0,
    credits_per_month: 3,
    is_unlimited: false,
    is_free: true,
    is_active: true,
    sort_order: 1,
    type: "empresa",
    plan_type: "empresa",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: null,
  },
  {
    id: "2",
    name: "Pro Mensal",
    description: "Plano profissional mensal",
    price_monthly: 99.90,
    price_yearly: null,
    credits_per_month: 50,
    is_unlimited: false,
    is_free: false,
    is_active: true,
    sort_order: 2,
    type: "empresa",
    plan_type: "empresa",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: null,
  },
  {
    id: "3",
    name: "Pro Anual",
    description: "Plano profissional anual com desconto",
    price_monthly: null,
    price_yearly: 999.00,
    credits_per_month: 50,
    is_unlimited: false,
    is_free: false,
    is_active: true,
    sort_order: 3,
    type: "empresa",
    plan_type: "empresa",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: null,
  },
  {
    id: "4",
    name: "Ilimitado",
    description: "Créditos ilimitados",
    price_monthly: 199.90,
    price_yearly: 1999.00,
    credits_per_month: null,
    is_unlimited: true,
    is_free: false,
    is_active: true,
    sort_order: 4,
    type: "empresa",
    plan_type: "empresa",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: null,
  },
];

export default function PlanosPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(MOCK_PLANS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .order("sort_order", { ascending: true });
        if (!error && data) setPlans(data);
      } catch {
        // fallback to mock
      }
    })();
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
      is_active: boolean;
      type: string;
      sort_order: number;
      features?: string;
    }, id?: string) => {
      const payload = {
        name: data.name,
        description: data.description ?? null,
        price_monthly: data.price_monthly,
        price_yearly: data.price_yearly,
        credits_per_month: data.credits_per_month ?? null,
        is_unlimited: data.is_unlimited,
        is_free: data.is_free,
        is_active: data.is_active,
        type: data.type,
        sort_order: data.sort_order,
      };
      try {
        const supabase = createClient();
        // The generated Update/Insert types are generic — cast via any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabase as any;
        if (id) {
          const { data: updated, error } = await db
            .from("subscription_plans")
            .update(payload)
            .eq("id", id)
            .select()
            .single();
          if (!error && updated) {
            setPlans((prev) =>
              prev.map((p) => (p.id === id ? (updated as SubscriptionPlan) : p))
            );
            return;
          }
        } else {
          const { data: created, error } = await db
            .from("subscription_plans")
            .insert(payload)
            .select()
            .single();
          if (!error && created) {
            setPlans((prev) => [...prev, created as SubscriptionPlan]);
            return;
          }
        }
      } catch {
        // fallback
      }
      if (id) {
        setPlans((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...payload, plan_type: payload.type } : p))
        );
      } else {
        const temp: SubscriptionPlan = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: null,
          plan_type: payload.type,
          ...payload,
        };
        setPlans((prev) => [...prev, temp]);
      }
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
