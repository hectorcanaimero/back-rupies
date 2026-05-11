import { createAdminClient } from "@/lib/supabase/admin";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import type { ChatWithRelations } from "@/types/app";

const MOCK_CHATS: ChatWithRelations[] = [
  {
    id: "1",
    userIdA: "1",
    userIdB: "2",
    serviceId: "1",
    leadId: null,
    last_message: "Pode vir amanhã às 9h?",
    last_message_at: "2025-05-09T18:00:00Z",
    created_at: "2025-05-05T10:00:00Z",
    updated_at: null,
    userA: { id: "1", display_name: "João Silva", email: "joao@empresa.com" },
    userB: { id: "2", display_name: "Maria Santos", email: "maria@gmail.com" },
    services: { id: "1", name: "Eletricista residencial" },
  },
  {
    id: "2",
    userIdA: "3",
    userIdB: "4",
    serviceId: null,
    leadId: "1",
    last_message: "Enviando proposta agora",
    last_message_at: "2025-05-08T14:30:00Z",
    created_at: "2025-05-07T11:00:00Z",
    updated_at: null,
    userA: { id: "3", display_name: "Carlos Lima", email: "carlos@tech.co" },
    userB: { id: "4", display_name: "Ana Oliveira", email: "ana@email.com" },
    services: null,
  },
  {
    id: "3",
    userIdA: "5",
    userIdB: "2",
    serviceId: "2",
    leadId: null,
    last_message: "Obrigado pelo serviço!",
    last_message_at: "2025-05-01T16:00:00Z",
    created_at: "2025-04-28T09:00:00Z",
    updated_at: null,
    userA: { id: "5", display_name: "Pedro Costa", email: "pedro@empresa.br" },
    userB: { id: "2", display_name: "Maria Santos", email: "maria@gmail.com" },
    services: { id: "2", name: "Pintura comercial" },
  },
];

async function getChats(): Promise<ChatWithRelations[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("chats")
      .select(`
        *,
        userA:users!chats_userIdA_fkey(id, display_name, email),
        userB:users!chats_userIdB_fkey(id, display_name, email),
        services(id, name)
      `)
      .order("last_message_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    const typed = data as ChatWithRelations[];
    return typed?.length ? typed : MOCK_CHATS;
  } catch {
    return MOCK_CHATS;
  }
}

export default async function ChatsPage() {
  const chats = await getChats();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chats</h1>
          <p className="text-sm text-muted-foreground">{chats.length} conversas</p>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={chats}
        searchKey="last_message"
        searchPlaceholder="Buscar por mensagem..."
      />
    </div>
  );
}
