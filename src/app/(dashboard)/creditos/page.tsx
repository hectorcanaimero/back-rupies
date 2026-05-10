import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import type { CreditBalanceWithUser } from "@/types/app";

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_CREDIT_BALANCES: CreditBalanceWithUser[] = [
  {
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
  },
  {
    id: "bal-2",
    user_id: "user-2",
    subscription_id: "sub-2",
    period_start: "2026-05-05T00:00:00Z",
    period_end: "2026-05-19T00:00:00Z",
    credits_granted: 10,
    credits_used: 2,
    credits_remaining: 8,
    is_unlimited: false,
    created_at: "2026-05-05T00:00:00Z",
    updated_at: "2026-05-07T10:00:00Z",
    users: { id: "user-2", display_name: "Maria Santos", email: "maria@gmail.com" },
  },
  {
    id: "bal-3",
    user_id: "user-3",
    subscription_id: "sub-3",
    period_start: "2026-04-01T00:00:00Z",
    period_end: "2026-05-01T00:00:00Z",
    credits_granted: 50,
    credits_used: 50,
    credits_remaining: 0,
    is_unlimited: false,
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-28T18:00:00Z",
    users: { id: "user-3", display_name: "Carlos Lima", email: "carlos@tech.co" },
  },
  {
    id: "bal-4",
    user_id: "user-6",
    subscription_id: "sub-6",
    period_start: "2026-05-01T00:00:00Z",
    period_end: "2026-06-01T00:00:00Z",
    credits_granted: 0,
    credits_used: null,
    credits_remaining: null,
    is_unlimited: true,
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-01T00:00:00Z",
    users: { id: "user-6", display_name: "Empresa Premium", email: "premium@empresa.com" },
  },
  {
    id: "bal-5",
    user_id: "user-4",
    subscription_id: "sub-4",
    period_start: "2026-04-01T00:00:00Z",
    period_end: "2026-05-01T00:00:00Z",
    credits_granted: 200,
    credits_used: 45,
    credits_remaining: 155,
    is_unlimited: false,
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-20T14:00:00Z",
    users: { id: "user-4", display_name: "Ana Oliveira", email: "ana@email.com" },
  },
];

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function getCreditBalances(): Promise<CreditBalanceWithUser[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("credit_balances")
      .select(`
        *,
        users ( id, display_name, email )
      `)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data as CreditBalanceWithUser[]) ?? MOCK_CREDIT_BALANCES;
  } catch {
    return MOCK_CREDIT_BALANCES;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CreditosPage() {
  const balances = await getCreditBalances();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Créditos</h1>
          <p className="text-sm text-muted-foreground">{balances.length} registros</p>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={balances}
        searchKey="usuario"
        searchPlaceholder="Buscar por usuário..."
      />
    </div>
  );
}
