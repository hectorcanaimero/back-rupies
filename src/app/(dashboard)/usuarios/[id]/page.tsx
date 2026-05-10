import { createClient } from "@/lib/supabase/server";
import { DetailPanel } from "@/components/record-detail";
import { Button } from "@/components/ui/button";
import { UserTabs } from "./user-tabs";
import type { User } from "@/types/app";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_USER: User = {
  id: "1",
  display_name: "João Silva",
  email: "joao@empresa.com",
  phone: "11999998888",
  cpfcnpj: "12345678000190",
  isContractor: true,
  status: true,
  ban: false,
  endRegister: true,
  rating: 4.8,
  city: "São Paulo",
  state: "SP",
  address: "Rua Augusta, 100",
  cep: "01001-000",
  chave_pix: "joao@empresa.com",
  type_company: "Construção",
  bio: "Empresa de construção civil com 10 anos de experiência.",
  created_at: "2025-01-15T10:00:00Z",
  updated_at: null,
  push: null,
  photo_url: null,
  name_contractor: "Silva Ltda",
  latLng: null,
  place_name: null,
  app: "empresa",
  fcm_token: null,
};

const MOCK_USER_SERVICES = [
  {
    id: "1",
    name: "Eletricista residencial",
    condition: "Opened",
    created_at: "2025-05-20T10:00:00Z",
  },
  {
    id: "2",
    name: "Pintura comercial",
    condition: "Finished",
    created_at: "2025-04-15T14:00:00Z",
  },
];

const MOCK_SUBSCRIPTION = {
  plan_name: "Pro Mensal",
  status: "active",
  credits_remaining: 23,
  credits_granted: 50,
  period_start: "2025-05-01T00:00:00Z",
  period_end: "2025-06-01T00:00:00Z",
};

const MOCK_TIMELINE = [
  {
    id: "1",
    title: "Criou serviço 'Eletricista residencial'",
    timestamp: "2025-05-20T10:00:00Z",
  },
  {
    id: "2",
    title: "Pagamento aprovado - R$ 99,90",
    timestamp: "2025-05-01T08:00:00Z",
  },
  {
    id: "3",
    title: "Registro completo",
    timestamp: "2025-01-15T10:00:00Z",
  },
];

// ─── Data fetchers ─────────────────────────────────────────────────────────────

async function getUser(id: string): Promise<User> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data ?? MOCK_USER;
  } catch {
    return MOCK_USER;
  }
}

async function getUserServices(userId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("id, name, condition, created_at")
      .eq("userId", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? MOCK_USER_SERVICES;
  } catch {
    return MOCK_USER_SERVICES;
  }
}

async function getUserSubscription(userId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan_name, status, credits_remaining, credits_granted, period_start, period_end")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ?? MOCK_SUBSCRIPTION;
  } catch {
    return MOCK_SUBSCRIPTION;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function UsuarioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [user, services, subscription] = await Promise.all([
    getUser(id),
    getUserServices(id),
    getUserSubscription(id),
  ]);

  const isBanned = user.ban === true;
  const isActive = user.status === true;

  return (
    <DetailPanel
      title={user.display_name ?? "Usuário"}
      subtitle={user.email ?? undefined}
      backHref="/usuarios"
      actions={
        <>
          <Button variant="destructive" size="sm">
            {isBanned ? "Desbanir" : "Banir"}
          </Button>
          <Button variant="outline" size="sm">
            {isActive ? "Desativar" : "Ativar"}
          </Button>
        </>
      }
    >
      <UserTabs
        user={user}
        services={services}
        subscription={subscription}
        timeline={MOCK_TIMELINE}
      />
    </DetailPanel>
  );
}
