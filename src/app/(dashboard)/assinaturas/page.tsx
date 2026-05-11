import { createAdminClient } from "@/lib/supabase/admin";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import { ExportCsvButton } from "@/components/export-csv-button";
import type { SubscriptionWithRelations } from "@/types/app";

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_SUBSCRIPTIONS: SubscriptionWithRelations[] = [
  {
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
  },
  {
    id: "sub-2",
    user_id: "user-2",
    plan_id: "plan-2",
    asaas_subscription_id: "sub_def456",
    asaas_customer_id: "cus_abc111",
    status: "trialing",
    billing_cycle: "monthly",
    current_period_start: "2026-05-05T00:00:00Z",
    current_period_end: "2026-05-19T00:00:00Z",
    cancel_at_period_end: false,
    canceled_at: null,
    trial_start: "2026-05-05T00:00:00Z",
    trial_end: "2026-05-19T00:00:00Z",
    metadata: null,
    created_at: "2026-05-05T08:00:00Z",
    updated_at: "2026-05-05T08:00:00Z",
    users: { id: "user-2", display_name: "Maria Santos", email: "maria@gmail.com" },
    subscription_plans: { id: "plan-2", name: "Starter", price_monthly: 49.90, price_yearly: null },
  },
  {
    id: "sub-3",
    user_id: "user-3",
    plan_id: "plan-1",
    asaas_subscription_id: "sub_ghi789",
    asaas_customer_id: "cus_bbb222",
    status: "past_due",
    billing_cycle: "monthly",
    current_period_start: "2026-04-01T00:00:00Z",
    current_period_end: "2026-05-01T00:00:00Z",
    cancel_at_period_end: false,
    canceled_at: null,
    trial_start: null,
    trial_end: null,
    metadata: null,
    created_at: "2025-12-15T09:00:00Z",
    updated_at: "2026-05-01T00:00:00Z",
    users: { id: "user-3", display_name: "Carlos Lima", email: "carlos@tech.co" },
    subscription_plans: { id: "plan-1", name: "Pro Mensal", price_monthly: 99.90, price_yearly: null },
  },
  {
    id: "sub-4",
    user_id: "user-4",
    plan_id: "plan-3",
    asaas_subscription_id: "sub_jkl012",
    asaas_customer_id: "cus_ccc333",
    status: "cancelled",
    billing_cycle: "yearly",
    current_period_start: "2025-05-01T00:00:00Z",
    current_period_end: "2026-05-01T00:00:00Z",
    cancel_at_period_end: false,
    canceled_at: "2026-03-15T14:00:00Z",
    trial_start: null,
    trial_end: null,
    metadata: null,
    created_at: "2025-05-01T11:00:00Z",
    updated_at: "2026-03-15T14:00:00Z",
    users: { id: "user-4", display_name: "Ana Oliveira", email: "ana@email.com" },
    subscription_plans: { id: "plan-3", name: "Enterprise Anual", price_monthly: null, price_yearly: 1188.00 },
  },
  {
    id: "sub-5",
    user_id: "user-5",
    plan_id: "plan-2",
    asaas_subscription_id: null,
    asaas_customer_id: null,
    status: "incomplete",
    billing_cycle: "monthly",
    current_period_start: null,
    current_period_end: null,
    cancel_at_period_end: false,
    canceled_at: null,
    trial_start: null,
    trial_end: null,
    metadata: null,
    created_at: "2026-05-09T16:00:00Z",
    updated_at: "2026-05-09T16:00:00Z",
    users: { id: "user-5", display_name: "Pedro Costa", email: "pedro@empresa.br" },
    subscription_plans: { id: "plan-2", name: "Starter", price_monthly: 49.90, price_yearly: null },
  },
];

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function getSubscriptions(): Promise<SubscriptionWithRelations[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        *,
        users ( id, display_name, email ),
        subscription_plans ( id, name, price_monthly, price_yearly )
      `)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    const typed = data as SubscriptionWithRelations[];
    return typed?.length ? typed : MOCK_SUBSCRIPTIONS;
  } catch {
    return MOCK_SUBSCRIPTIONS;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AssinaturasPage() {
  const subscriptions = await getSubscriptions();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assinaturas</h1>
          <p className="text-sm text-muted-foreground">
            {subscriptions.length} registros
          </p>
        </div>
        <ExportCsvButton
          data={subscriptions}
          filename="assinaturas"
          columns={[
            { key: "id", label: "ID" },
            { key: "status", label: "Status" },
            { key: "billing_cycle", label: "Ciclo" },
            { key: "current_period_start", label: "Início" },
            { key: "current_period_end", label: "Fim" },
            { key: "created_at", label: "Criado em" },
          ]}
        />
      </div>
      <DataTable
        columns={columns}
        data={subscriptions}
        searchKey="usuario"
        searchPlaceholder="Buscar por usuário..."
      />
    </div>
  );
}
