import { createAdminClient } from "@/lib/supabase/admin";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import type { LeadWithUser } from "@/types/app";

async function getLeads(): Promise<LeadWithUser[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_leads")
    .select("*, users:rp_users(id, name, email)")
    .order("created_at", { ascending: false })
    .limit(1000);
  return data ?? [];
}

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">{leads.length} registros</p>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={leads}
        searchKey="title"
        searchPlaceholder="Buscar por nome..."
      />
    </div>
  );
}
