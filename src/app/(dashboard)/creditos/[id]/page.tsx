import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { DetailPanel } from "@/components/record-detail";
import { CreditTabs } from "./credit-tabs";
import type { CreditBalanceWithUser } from "@/types/app";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CreditConsumptionEntry {
  id: string;
  action: string;
  reference_id: string | null;
  credits_consumed: number;
  timestamp: string;
}

// ─── Data fetchers ─────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  service_created: "Serviço criado",
  contractor_contacted: "Contratante contactado",
  candidatura: "Candidatura",
  grant: "Créditos concedidos",
  weekly_grant: "Créditos semanais",
  refund: "Reembolso",
};

async function getCreditBalance(id: string): Promise<CreditBalanceWithUser | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_credit_balances")
    .select(`
      *,
      users:rp_users ( id, name, email )
    `)
    .eq("id", id)
    .maybeSingle();
  return data;
}

async function getConsumption(balanceId: string): Promise<CreditConsumptionEntry[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_credit_transactions")
    .select("id, action_type, reference_id, amount, created_at")
    .eq("balance_id", balanceId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((t) => ({
    id: t.id,
    action: ACTION_LABELS[t.action_type] ?? t.action_type,
    reference_id: t.reference_id,
    credits_consumed: t.amount,
    timestamp: t.created_at ?? "",
  }));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CreditoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [balance, consumption] = await Promise.all([getCreditBalance(id), getConsumption(id)]);
  if (!balance) notFound();
  const userName = balance.users?.name || "Créditos";
  const periodo =
    balance.period_start && balance.period_end
      ? `Período: ${balance.period_start.slice(0, 10)} → ${balance.period_end.slice(0, 10)}`
      : "Saldo de Créditos";

  return (
    <DetailPanel
      title={userName}
      subtitle={periodo}
      backHref="/creditos"
    >
      <CreditTabs balance={balance} consumption={consumption} />
    </DetailPanel>
  );
}
