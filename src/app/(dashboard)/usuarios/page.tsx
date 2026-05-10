import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import type { User } from "@/types/app";

// Mock data for development
const MOCK_USERS: User[] = [
  {
    id: "1",
    display_name: "João Silva",
    email: "joao@empresa.com",
    isContractor: true,
    status: true,
    ban: false,
    endRegister: true,
    rating: 4.8,
    city: "São Paulo",
    state: "SP",
    created_at: "2025-01-15T10:00:00Z",
    phone: "11999998888",
    address: "Rua X",
    cep: "01001-000",
    cpfcnpj: "12345678000190",
    updated_at: null,
    push: null,
    photo_url: null,
    name_contractor: "Silva Ltda",
    latLng: null,
    place_name: null,
    app: "empresa",
    bio: null,
    fcm_token: null,
    type_company: "Construção",
    chave_pix: null,
  },
  {
    id: "2",
    display_name: "Maria Santos",
    email: "maria@gmail.com",
    isContractor: false,
    status: true,
    ban: false,
    endRegister: true,
    rating: 4.5,
    city: "Rio de Janeiro",
    state: "RJ",
    created_at: "2025-02-20T14:00:00Z",
    phone: "21988887777",
    address: "Av Y",
    cep: "20000-000",
    cpfcnpj: "98765432101",
    updated_at: null,
    push: null,
    photo_url: null,
    name_contractor: null,
    latLng: null,
    place_name: null,
    app: "mao",
    bio: "Eletricista profissional",
    fcm_token: null,
    type_company: null,
    chave_pix: null,
  },
  {
    id: "3",
    display_name: "Carlos Lima",
    email: "carlos@tech.co",
    isContractor: true,
    status: true,
    ban: true,
    endRegister: true,
    rating: 2.1,
    city: "Belo Horizonte",
    state: "MG",
    created_at: "2025-03-10T08:00:00Z",
    phone: "31977776666",
    address: null,
    cep: null,
    cpfcnpj: "11222333000144",
    updated_at: null,
    push: null,
    photo_url: null,
    name_contractor: "Tech Co",
    latLng: null,
    place_name: null,
    app: "empresa",
    bio: null,
    fcm_token: null,
    type_company: "Tecnologia",
    chave_pix: null,
  },
  {
    id: "4",
    display_name: "Ana Oliveira",
    email: "ana@email.com",
    isContractor: false,
    status: false,
    ban: false,
    endRegister: true,
    rating: 3.9,
    city: "Curitiba",
    state: "PR",
    created_at: "2025-04-05T16:00:00Z",
    phone: "41966665555",
    address: null,
    cep: null,
    cpfcnpj: "44455566677",
    updated_at: null,
    push: null,
    photo_url: null,
    name_contractor: null,
    latLng: null,
    place_name: null,
    app: "mao",
    bio: null,
    fcm_token: null,
    type_company: null,
    chave_pix: null,
  },
  {
    id: "5",
    display_name: "Pedro Costa",
    email: "pedro@empresa.br",
    isContractor: true,
    status: true,
    ban: false,
    endRegister: false,
    rating: null,
    city: "Salvador",
    state: "BA",
    created_at: "2025-05-01T12:00:00Z",
    phone: "71955554444",
    address: null,
    cep: null,
    cpfcnpj: null,
    updated_at: null,
    push: null,
    photo_url: null,
    name_contractor: null,
    latLng: null,
    place_name: null,
    app: "empresa",
    bio: null,
    fcm_token: null,
    type_company: null,
    chave_pix: null,
  },
];

async function getUsers(): Promise<User[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data ?? MOCK_USERS;
  } catch {
    return MOCK_USERS;
  }
}

export default async function UsuariosPage() {
  const users = await getUsers();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-sm text-muted-foreground">{users.length} registros</p>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={users}
        searchKey="display_name"
        searchPlaceholder="Buscar por nome..."
      />
    </div>
  );
}
