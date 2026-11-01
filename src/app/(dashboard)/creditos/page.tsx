import { createAdminClient } from "@/lib/supabase/admin";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import { ExportCsvButton } from "@/components/export-csv-button";
import type { CreditBalanceWithUser } from "@/types/app";

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function getCreditBalances(): Promise<CreditBalanceWithUser[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_credit_balances")
    .select(`
      *,
      users:rp_users ( id, name, email )
    `)
    .order("period_start", { ascending: false })
    .limit(1000);
  return data ?? [];
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
        <ExportCsvButton
          data={balances}
          filename="creditos"
          columns={[
            { key: "id", label: "ID" },
            { key: "period_start", label: "Período início" },
            { key: "period_end", label: "Período fim" },
            { key: "credits_granted", label: "Concedidos" },
            { key: "credits_used", label: "Usados" },
            { key: "credits_remaining", label: "Restantes" },
            { key: "kind", label: "Tipo" },
          ]}
        />
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
