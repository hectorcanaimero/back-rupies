import { createClient } from "@/lib/supabase/server";
import { DetailPanel } from "@/components/record-detail";
import { Button } from "@/components/ui/button";
import { SubscriptionTabs } from "./subscription-tabs";
import type { SubscriptionWithRelations, SubscriptionUsage, CreditBalance } from "@/types/app";

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_SUBSCRIPTION: SubscriptionWithRelations = {
  id: "sub-1",
  user_id: "user-1",
  plan_id: "plan-1",
  asaas_subscription_id: "sub_abc123",
  asaas_customer_id: "cus_xyz789",
  status: "active",
  billing_cycle: "monthly",
  current_period_start: "2026-05-01T00:00:00Z",
  current_period_end: "2026-06-01T00:00:00Z",
  cancel_at_period_end: false,
  canceled_at: null,
  trial_start: null,
  trial_end: null,
  metadata: null,
  created_at: "2026-01-10T10:00:00Z",
  updated_at: "2026-05-01T00:00:00Z",
  users: { id: "user-1", display_name: "João Silva", email: "joao@empresa.com" },
  subscription_plans: { id: "plan-1", name: "Pro Mensal", price_monthly: 99.90, price_yearly: null },
};

const MOCK_USAGE: SubscriptionUsage = {
  id: "usage-1",
  subscription_id: "sub-1",
  period_start: "2026-05-01T00:00:00Z",
  period_end: "2026-06-01T00:00:00Z",
  services_created: 7,
  contractors_contacted: 15,
  candidates_received: 42,
  updated_at: "2026-05-10T08:00:00Z",
};

const MOCK_CREDIT_BALANCE: CreditBalance = {
  id: "bal-1",
  user_id: "user-1",
  subscription_id: "sub-1",
  period_start: "2026-05-01T00:00:00Z",
  period_end: "2026-06-01T00:00:00Z",
  credits_granted: 50,
  credits_used: 27,
  credits_remaining: 23,
  is_unlimited: false,
  created_at: "2026-05-01T00:00:00Z",
  updated_at: "2026-05-10T08:00:00Z",
};

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

async function getSubscription(id: string): Promise<SubscriptionWithRelations> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        *,
        users ( id, display_name, email ),
        subscription_plans ( id, name, price_monthly, price_yearly )
      `)
      .eq("id", id)
      .single();
    if (error) throw error;
    return (data as SubscriptionWithRelations) ?? MOCK_SUBSCRIPTION;
  } catch {
    return MOCK_SUBSCRIPTION;
  }
}

async function getSubscriptionUsage(subscriptionId: string): Promise<SubscriptionUsage | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subscription_usage")
      .select("*")
      .eq("subscription_id", subscriptionId)
      .order("period_start", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ?? MOCK_USAGE;
  } catch {
    return MOCK_USAGE;
  }
}

async function getSubscriptionCredits(subscriptionId: string): Promise<CreditBalance | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("credit_balances")
      .select("*")
      .eq("subscription_id", subscriptionId)
      .order("period_start", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ?? MOCK_CREDIT_BALANCE;
  } catch {
    return MOCK_CREDIT_BALANCE;
  }
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

  const userName = subscription.users?.display_name ?? "Assinatura";
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
