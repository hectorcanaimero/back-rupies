import { createAdminClient } from "@/lib/supabase/admin";
import { DetailPanel } from "@/components/record-detail";
import { CreditTabs } from "./credit-tabs";
import type { CreditBalanceWithUser } from "@/types/app";

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_BALANCE: CreditBalanceWithUser = {
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
  users: { id: "user-1", display_name: "João Silva", email: "joao@empresa.com" },
};

const MOCK_CONSUMPTION: CreditConsumptionEntry[] = [
  {
    id: "cons-1",
    action: "Serviço criado",
    reference_id: "srv-123",
    credits_consumed: 5,
    timestamp: "2026-05-10T08:30:00Z",
  },
  {
    id: "cons-2",
    action: "Contratante contactado",
    reference_id: "usr-456",
    credits_consumed: 2,
    timestamp: "2026-05-09T16:00:00Z",
  },
  {
    id: "cons-3",
    action: "Candidatura recebida",
    reference_id: "cand-789",
    credits_consumed: 1,
    timestamp: "2026-05-08T11:00:00Z",
  },
  {
    id: "cons-4",
    action: "Serviço criado",
    reference_id: "srv-124",
    credits_consumed: 5,
    timestamp: "2026-05-07T09:15:00Z",
  },
  {
    id: "cons-5",
    action: "Contratante contactado",
    reference_id: "usr-789",
    credits_consumed: 2,
    timestamp: "2026-05-06T14:45:00Z",
  },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CreditConsumptionEntry {
  id: string;
  action: string;
  reference_id: string | null;
  credits_consumed: number;
  timestamp: string;
}

// ─── Data fetchers ─────────────────────────────────────────────────────────────

async function getCreditBalance(id: string): Promise<CreditBalanceWithUser> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("credit_balances")
      .select(`
        *,
        users ( id, display_name, email )
      `)
      .eq("id", id)
      .single();
    if (error) throw error;
    return (data as CreditBalanceWithUser) ?? MOCK_BALANCE;
  } catch {
    return MOCK_BALANCE;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CreditoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const balance = await getCreditBalance(id);
  const userName = balance.users?.display_name ?? "Créditos";
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
      <CreditTabs balance={balance} consumption={MOCK_CONSUMPTION} />
    </DetailPanel>
  );
}
