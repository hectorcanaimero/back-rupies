import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { DetailPanel } from "@/components/record-detail";
import { Button } from "@/components/ui/button";
import { SubscriptionTabs } from "./subscription-tabs";
import type { SubscriptionWithRelations, SubscriptionUsage, CreditBalance } from "@/types/app";

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_TIMELINE = [
  {
    id: "ev-1",
    title: "Assinatura renovada automaticamente",
    description: "Cobrança de R$ 99,90 aprovada via Asaas",
    timestamp: "2026-05-01T08:00:00Z",
  },
  {
    id: "ev-2",
    title: "Créditos resetados para o novo período",
    description: "50 créditos concedidos",
    timestamp: "2026-05-01T08:05:00Z",
  },
  {
    id: "ev-3",
    title: "Plano alterado de Starter para Pro Mensal",
    description: null,
    timestamp: "2026-03-10T14:00:00Z",
  },
  {
    id: "ev-4",
    title: "Assinatura criada",
    description: "Plano Starter — primeiro pagamento",
    timestamp: "2026-01-10T10:00:00Z",
  },
];

// ─── Data fetchers ──────────────────────────────────────────────────────────────

async function getSubscription(id: string): Promise<SubscriptionWithRelations | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_subscriptions")
    .select(`
      *,
      users:rp_users ( id, name, email ),
      subscription_plans:rp_subscription_plans ( id, name, price_monthly, price_yearly, is_unlimited )
    `)
    .eq("id", id)
    .maybeSingle();
  return data;
}

async function getSubscriptionUsage(subscriptionId: string): Promise<SubscriptionUsage | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_subscription_usage")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

async function getSubscriptionCredits(subscriptionId: string): Promise<CreditBalance | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_credit_balances")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AssinaturaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [subscription, usage, credits] = await Promise.all([
    getSubscription(id),
    getSubscriptionUsage(id),
    getSubscriptionCredits(id),
  ]);
  if (!subscription) notFound();

  const userName = subscription.users?.name || "Assinatura";
  const planName = subscription.subscription_plans?.name ?? "";

  return (
    <DetailPanel
      title={userName}
      subtitle={planName}
      backHref="/assinaturas"
      actions={
        <>
          <Button variant="outline" size="sm">
            Estender Trial
          </Button>
          <Button variant="outline" size="sm">
            Mudar Plano
          </Button>
          <Button variant="destructive" size="sm">
            Cancelar Assinatura
          </Button>
        </>
      }
    >
      <SubscriptionTabs
        subscription={subscription}
        usage={usage}
        credits={credits}
        timeline={MOCK_TIMELINE}
      />
    </DetailPanel>
  );
}
