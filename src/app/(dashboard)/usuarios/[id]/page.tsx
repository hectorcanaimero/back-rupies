import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { DetailPanel } from "@/components/record-detail";
import { Button } from "@/components/ui/button";
import { UserTabs } from "./user-tabs";
import type { User } from "@/types/app";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_TIMELINE = [
  {
    id: "1",
    title: "Criou serviço 'Eletricista residencial'",
    timestamp: "2025-05-20T10:00:00Z",
  },
  {
    id: "2",
    title: "Pagamento aprovado - R$ 99,90",
    timestamp: "2025-05-01T08:00:00Z",
  },
  {
    id: "3",
    title: "Registro completo",
    timestamp: "2025-01-15T10:00:00Z",
  },
];

// ─── Data fetchers ─────────────────────────────────────────────────────────────

async function getUser(id: string): Promise<User | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("rp_users").select("*").eq("id", id).maybeSingle();
  return data;
}

async function getUserServices(userId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_services")
    .select("id, title, condition, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

async function getUserSubscription(userId: string) {
  const supabase = createAdminClient();
  const [{ data: sub }, { data: balance }] = await Promise.all([
    supabase
      .from("rp_subscriptions")
      .select("status, current_period_start, current_period_end, rp_subscription_plans(name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("rp_credit_balances")
      .select("credits_granted, credits_remaining")
      .eq("user_id", userId)
      .order("period_start", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (!sub) return null;
  return {
    plan_name: sub.rp_subscription_plans?.name ?? "—",
    status: sub.status,
    credits_remaining: balance?.credits_remaining ?? 0,
    credits_granted: balance?.credits_granted ?? 0,
    period_start: sub.current_period_start,
    period_end: sub.current_period_end,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function UsuarioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [user, services, subscription] = await Promise.all([
    getUser(id),
    getUserServices(id),
    getUserSubscription(id),
  ]);

  if (!user) notFound();

  const isBanned = user.ban === true;
  const isActive = user.status === true;

  return (
    <DetailPanel
      title={user.name || "Usuário"}
      subtitle={user.email ?? undefined}
      backHref="/usuarios"
      actions={
        <>
          <Button variant="destructive" size="sm">
            {isBanned ? "Desbanir" : "Banir"}
          </Button>
          <Button variant="outline" size="sm">
            {isActive ? "Desativar" : "Ativar"}
          </Button>
        </>
      }
    >
      <UserTabs
        user={user}
        services={services}
        subscription={subscription}
        timeline={MOCK_TIMELINE}
      />
    </DetailPanel>
  );
}
