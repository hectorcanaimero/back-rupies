import { createAdminClient } from "@/lib/supabase/admin";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import { ExportCsvButton } from "@/components/export-csv-button";
import type { Service } from "@/types/app";

async function getServices(): Promise<Service[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_services")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);
  return data ?? [];
}

export default async function ServicosPage() {
  const services = await getServices();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Serviços</h1>
          <p className="text-sm text-muted-foreground">{services.length} registros</p>
        </div>
        <ExportCsvButton
          data={services}
          filename="servicos"
          columns={[
            { key: "id", label: "ID" },
            { key: "title", label: "Nome" },
            { key: "condition", label: "Condição" },
            { key: "job_type", label: "Tipo" },
            { key: "created_at", label: "Criado em" },
          ]}
        />
      </div>
      <DataTable
        columns={columns}
        data={services}
        searchKey="title"
        searchPlaceholder="Buscar por nome..."
      />
    </div>
  );
}
