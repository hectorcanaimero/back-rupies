import { createAdminClient } from "@/lib/supabase/admin";
import { DetailPanel } from "@/components/record-detail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FieldGrid } from "@/components/record-detail";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { SubscriptionPlan } from "@/types/app";

const MOCK_PLAN: SubscriptionPlan = {
  id: "2",
  name: "Pro Mensal",
  description: "Plano profissional mensal com acesso completo",
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
};

async function getPlan(id: string): Promise<SubscriptionPlan> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data ?? MOCK_PLAN;
  } catch {
    return MOCK_PLAN;
  }
}

async function getSubscriberCount(planId: string): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("plan_id", planId)
      .eq("status", "active");
    if (error) throw error;
    return count ?? 0;
  } catch {
    return 42; // mock
  }
}

export default async function PlanoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [plan, subscriberCount] = await Promise.all([
    getPlan(id),
    getSubscriberCount(id),
  ]);

  const fields = [
    { label: "Nome", value: plan.name },
    { label: "Descrição", value: plan.description ?? "—" },
    { label: "Preço Mensal", value: formatCurrency(plan.price_monthly) },
    { label: "Preço Anual", value: formatCurrency(plan.price_yearly) },
    {
      label: "Créditos/mês",
      value: plan.is_unlimited ? "Ilimitado" : String(plan.credits_per_month ?? "—"),
    },
    { label: "Tipo", value: plan.type ?? plan.plan_type ?? "—" },
    { label: "Ordem", value: String(plan.sort_order ?? "—") },
    {
      label: "Status",
      value: (
        <Badge variant={plan.is_active ? "default" : "secondary"}>
          {plan.is_active ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      label: "Gratuito",
      value: plan.is_free ? <Badge variant="secondary">Sim</Badge> : "Não",
    },
    {
      label: "Ilimitado",
      value: plan.is_unlimited ? <Badge variant="secondary">Sim</Badge> : "Não",
    },
    { label: "Criado em", value: formatDate(plan.created_at) },
    { label: "Atualizado em", value: formatDate(plan.updated_at) },
  ];

  return (
    <DetailPanel
      title={plan.name}
      subtitle={plan.description ?? undefined}
      backHref="/planos"
    >
      <div className="space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Assinantes ativos</p>
              <p className="text-3xl font-bold mt-1">{subscriberCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Receita mensal estimada</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency((plan.price_monthly ?? 0) * subscriberCount)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Tipo de plano</p>
              <p className="text-3xl font-bold mt-1 capitalize">
                {plan.type ?? plan.plan_type ?? "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Plan fields */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhes do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGrid fields={fields} columns={2} />
          </CardContent>
        </Card>
      </div>
    </DetailPanel>
  );
}
