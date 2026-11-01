import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { DetailPanel } from "@/components/record-detail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatThread } from "./chat-thread";
import { formatDate } from "@/lib/utils/format";
import type { Chat, ChatMessage } from "@/types/app";
import Link from "next/link";

interface ChatWithParticipants extends Chat {
  userA: { id: string; name: string; email: string } | null;
  userB: { id: string; name: string; email: string } | null;
  services: { id: string; title: string } | null;
}

// userA = empresa (contractor), userB = profissional (prestador)
async function getChat(id: string): Promise<ChatWithParticipants | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_chats")
    .select(`
        *,
        userA:rp_users!rp_chats_contractor_id_fkey(id, name, email),
        userB:rp_users!rp_chats_prestador_id_fkey(id, name, email),
        services:rp_services(id, title)
      `)
    .eq("id", id)
    .maybeSingle();
  return data;
}

async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_chat_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [chat, messages] = await Promise.all([getChat(id), getChatMessages(id)]);
  if (!chat) notFound();

  const participantA = chat.userA;
  const participantB = chat.userB;

  const titleA = participantA?.name || participantA?.email || "Participante A";
  const titleB = participantB?.name || participantB?.email || "Participante B";

  // Build participants map for ChatThread
  const participantsMap: Record<
    string,
    { id: string; name: string; email: string; role: "Empresa" | "Profissional" }
  > = {};
  if (participantA) {
    participantsMap[participantA.id] = {
      ...participantA,
      role: "Empresa",
    };
  }
  if (participantB) {
    participantsMap[participantB.id] = {
      ...participantB,
      role: "Profissional",
    };
  }

  return (
    <DetailPanel
      title={`${titleA} ↔ ${titleB}`}
      subtitle={
        chat.services
          ? `Serviço: ${chat.services.title}`
          : chat.lead_id
          ? `Lead #${chat.lead_id.slice(0, 8)}`
          : "Chat direto"
      }
      backHref="/chats"
    >
      <div className="space-y-4">
        {/* Meta info */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground mb-1">Iniciado em</p>
              <p className="text-sm font-medium">{formatDate(chat.created_at)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground mb-1">Mensagens</p>
              <p className="text-sm font-medium">{messages.length} mensagens</p>
            </CardContent>
          </Card>
        </div>

        {/* Participants info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Participantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[participantA, participantB].map((p, i) =>
                p ? (
                  <div key={p.id} className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">
                      {i === 0 ? "Contratante" : "Prestador"}
                    </p>
                    <Link
                      href={`/usuarios/${p.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {p.name || p.email || "—"}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {i === 0 ? "Empresa" : "Profissional"}
                    </p>
                  </div>
                ) : null
              )}
            </div>
          </CardContent>
        </Card>

        {/* Thread */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversa</CardTitle>
          </CardHeader>
          <CardContent>
            <ChatThread messages={messages} participants={participantsMap} />
          </CardContent>
        </Card>
      </div>
    </DetailPanel>
  );
}
