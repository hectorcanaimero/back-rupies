import { createAdminClient } from "@/lib/supabase/admin";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import type { ChatWithRelations } from "@/types/app";

// userA = empresa (contractor), userB = profissional (prestador)
async function getChats(): Promise<ChatWithRelations[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_chats")
    .select(`
        *,
        userA:rp_users!rp_chats_contractor_id_fkey(id, name, email),
        userB:rp_users!rp_chats_prestador_id_fkey(id, name, email),
        services:rp_services(id, title)
      `)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(100);
  return data ?? [];
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
        searchKey="participantes"
        searchPlaceholder="Buscar por participante..."
      />
    </div>
  );
}
