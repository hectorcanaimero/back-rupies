import { createAdminClient } from "@/lib/supabase/admin";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import { ExportCsvButton } from "@/components/export-csv-button";
import type { SubscriptionWithRelations } from "@/types/app";

// ─── Mock data ─────────────────────────────────────────────────────────────────

async function getSubscriptions(): Promise<SubscriptionWithRelations[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_subscriptions")
    .select(`
      *,
      users:rp_users ( id, name, email ),
      subscription_plans:rp_subscription_plans ( id, name, price_monthly, price_yearly, is_unlimited )
    `)
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
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
