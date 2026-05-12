import { createAdminClient } from "@/lib/supabase/admin";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import type { LeadWithUser } from "@/types/app";

const MOCK_LEADS: LeadWithUser[] = [
  {
    id: "1",
    userId: "1",
    name: "Fornecedor de EPI",
    description: "Preciso de 500 unidades de capacetes de segurança",
    type_supplier: "Equipamentos",
    budget: 15000,
    quantity: 500,
    return_deadline: "15 dias",
    finished: false,
    created_at: "2025-05-01T10:00:00Z",
    updated_at: null,
    users: { id: "1", display_name: "João Silva", email: "joao@empresa.com" },
  },
  {
    id: "2",
    userId: "3",
    name: "Serviço de Limpeza Industrial",
    description: "Limpeza mensal de galpão de 2000m²",
    type_supplier: "Serviços",
    budget: 8000,
    quantity: null,
    return_deadline: "7 dias",
    finished: true,
    created_at: "2025-04-15T14:00:00Z",
    updated_at: null,
    users: { id: "3", display_name: "Carlos Lima", email: "carlos@tech.co" },
  },
  {
    id: "3",
    userId: "5",
    name: "Consultoria em RH",
    description: "Implantação de sistema de avaliação de desempenho",
    type_supplier: "Consultoria",
    budget: 25000,
    quantity: null,
    return_deadline: "30 dias",
    finished: false,
    created_at: "2025-05-05T09:00:00Z",
    updated_at: null,
    users: { id: "5", display_name: "Pedro Costa", email: "pedro@empresa.br" },
  },
];

async function getLeads(): Promise<LeadWithUser[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*, users(id, display_name, email)")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    const typed = data as LeadWithUser[];
    return typed?.length ? typed : MOCK_LEADS;
  } catch {
    return MOCK_LEADS;
  }
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
        searchKey="name"
        searchPlaceholder="Buscar por nome..."
      />
    </div>
  );
}
