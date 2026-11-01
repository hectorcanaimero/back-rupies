import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { DetailPanel } from "@/components/record-detail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FieldGrid } from "@/components/record-detail";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { SubscriptionPlan } from "@/types/app";

async function getPlan(id: string): Promise<SubscriptionPlan | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_subscription_plans")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

async function getSubscriberCount(planId: string): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("rp_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("plan_id", planId)
    .eq("status", "active");
  return count ?? 0;
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
  if (!plan) notFound();

  const fields = [
    { label: "Nome", value: plan.name },
    { label: "Descrição", value: plan.description ?? "—" },
    { label: "Preço Mensal", value: formatCurrency(plan.price_monthly) },
    { label: "Preço Anual", value: formatCurrency(plan.price_yearly) },
    {
      label: "Créditos/mês",
      value: plan.is_unlimited ? "Ilimitado" : String(plan.credits_per_month ?? "—"),
    },
    { label: "Tipo", value: plan.plan_type || "—" },
    { label: "Versão", value: String(plan.plan_version) },
    {
      label: "Status",
      value: (
        <Badge variant={plan.active ? "default" : "secondary"}>
          {plan.active ? "Ativo" : "Inativo"}
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
                {plan.plan_type || "—"}
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
