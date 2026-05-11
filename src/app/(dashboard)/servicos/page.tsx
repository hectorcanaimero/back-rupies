import { createAdminClient } from "@/lib/supabase/admin";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import { ExportCsvButton } from "@/components/export-csv-button";
import type { Service } from "@/types/app";

const MOCK_SERVICES: Service[] = [
  {
    id: "1",
    name: "Eletricista residencial",
    userId: "1",
    userAproved: null,
    categoryId: "cat1",
    jobType: "Agendado",
    description: "Instalação elétrica completa",
    dateStart: "2025-06-01",
    dateEnd: "2025-06-05",
    skill: null,
    cep: "01001-000",
    address: "Rua Augusta 100",
    price: 2500,
    time: "4h",
    condition: "Opened",
    status: true,
    created_at: "2025-05-20T10:00:00Z",
    updated_at: null,
    candidated: 5,
    endRegister: true,
    latLng: null,
  },
  {
    id: "2",
    name: "Pintura comercial",
    userId: "1",
    userAproved: "2",
    categoryId: "cat2",
    jobType: "Urgente",
    description: "Pintura de escritório",
    dateStart: "2025-05-25",
    dateEnd: "2025-05-26",
    skill: null,
    cep: "20000-000",
    address: "Av Paulista 500",
    price: 4800,
    time: "8h",
    condition: "InProcess",
    status: true,
    created_at: "2025-05-18T14:00:00Z",
    updated_at: null,
    candidated: 3,
    endRegister: true,
    latLng: null,
  },
  {
    id: "3",
    name: "Limpeza pós-obra",
    userId: "3",
    userAproved: null,
    categoryId: "cat3",
    jobType: "Stand",
    description: "Limpeza completa após reforma",
    dateStart: null,
    dateEnd: null,
    skill: null,
    cep: "30000-000",
    address: "Rua da Consolação 200",
    price: 1200,
    time: "6h",
    condition: "Finished",
    status: true,
    created_at: "2025-05-10T08:00:00Z",
    updated_at: null,
    candidated: 8,
    endRegister: true,
    latLng: null,
  },
  {
    id: "4",
    name: "Encanador - vazamento",
    userId: "1",
    userAproved: null,
    categoryId: "cat4",
    jobType: "Urgente",
    description: "Reparo de vazamento urgente",
    dateStart: "2025-05-22",
    dateEnd: "2025-05-22",
    skill: null,
    cep: "01001-000",
    address: "Rua Oscar Freire 300",
    price: 800,
    time: "2h",
    condition: "Cancelled",
    status: true,
    created_at: "2025-05-15T16:00:00Z",
    updated_at: null,
    candidated: 2,
    endRegister: true,
    latLng: null,
  },
  {
    id: "5",
    name: "Ar condicionado - manutenção",
    userId: "3",
    userAproved: "4",
    categoryId: "cat5",
    jobType: "Agendado",
    description: "Manutenção preventiva de AC",
    dateStart: "2025-06-10",
    dateEnd: "2025-06-10",
    skill: null,
    cep: "40000-000",
    address: "Shopping Center Norte",
    price: 350,
    time: "1h",
    condition: "Accepted",
    status: true,
    created_at: "2025-05-08T12:00:00Z",
    updated_at: null,
    candidated: 1,
    endRegister: true,
    latLng: null,
  },
];

async function getServices(): Promise<Service[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data?.length ? data : MOCK_SERVICES;
  } catch {
    return MOCK_SERVICES;
  }
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
            { key: "name", label: "Nome" },
            { key: "condition", label: "Condição" },
            { key: "jobType", label: "Tipo" },
            { key: "created_at", label: "Criado em" },
          ]}
        />
      </div>
      <DataTable
        columns={columns}
        data={services}
        searchKey="name"
        searchPlaceholder="Buscar por nome..."
      />
    </div>
  );
}
