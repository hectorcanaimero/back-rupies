import { createAdminClient } from "@/lib/supabase/admin";
import { DetailPanel } from "@/components/record-detail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatThread } from "./chat-thread";
import { formatDate } from "@/lib/utils/format";
import type { Chat, ChatMessage } from "@/types/app";
import Link from "next/link";

interface ChatWithParticipants extends Chat {
  userA: { id: string; display_name: string | null; email: string | null; isContractor: boolean | null } | null;
  userB: { id: string; display_name: string | null; email: string | null; isContractor: boolean | null } | null;
  services: { id: string; name: string | null } | null;
}

const MOCK_CHAT: ChatWithParticipants = {
  id: "1",
  userIdA: "1",
  userIdB: "2",
  serviceId: "1",
  leadId: null,
  last_message: "Pode vir amanhã às 9h?",
  last_message_at: "2025-05-09T18:00:00Z",
  created_at: "2025-05-05T10:00:00Z",
  updated_at: null,
  userA: { id: "1", display_name: "João Silva", email: "joao@empresa.com", isContractor: true },
  userB: { id: "2", display_name: "Maria Santos", email: "maria@gmail.com", isContractor: false },
  services: { id: "1", name: "Eletricista residencial" },
};

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    chatId: "1",
    senderId: "1",
    type: "text",
    content: "Olá! Vi seu perfil e gostaria de contratar seus serviços.",
    media_url: null,
    read: true,
    created_at: "2025-05-05T10:00:00Z",
  },
  {
    id: "2",
    chatId: "1",
    senderId: "2",
    type: "text",
    content: "Olá! Claro, posso ajudar. Qual é o serviço que precisa?",
    media_url: null,
    read: true,
    created_at: "2025-05-05T10:05:00Z",
  },
  {
    id: "3",
    chatId: "1",
    senderId: "1",
    type: "text",
    content: "Preciso de um eletricista para instalar tomadas no escritório.",
    media_url: null,
    read: true,
    created_at: "2025-05-05T10:10:00Z",
  },
  {
    id: "4",
    chatId: "1",
    senderId: "2",
    type: "image",
    content: "Segue foto do meu trabalho anterior:",
    media_url: "https://placehold.co/400x300",
    read: true,
    created_at: "2025-05-06T09:00:00Z",
  },
  {
    id: "5",
    chatId: "1",
    senderId: "1",
    type: "text",
    content: "Pode vir amanhã às 9h?",
    media_url: null,
    read: false,
    created_at: "2025-05-09T18:00:00Z",
  },
];

async function getChat(id: string): Promise<ChatWithParticipants> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("chats")
      .select(`
        *,
        userA:users!chats_userIdA_fkey(id, display_name, email, isContractor),
        userB:users!chats_userIdB_fkey(id, display_name, email, isContractor),
        services(id, name)
      `)
      .eq("id", id)
      .single();
    if (error) throw error;
    return (data as ChatWithParticipants) ?? MOCK_CHAT;
  } catch {
    return MOCK_CHAT;
  }
}

async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("chats_message")
      .select("*")
      .eq("chatId", chatId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data?.length ? data : MOCK_MESSAGES;
  } catch {
    return MOCK_MESSAGES;
  }
}

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [chat, messages] = await Promise.all([getChat(id), getChatMessages(id)]);

  const participantA = chat.userA;
  const participantB = chat.userB;

  const titleA = participantA?.display_name ?? participantA?.email ?? "Participante A";
  const titleB = participantB?.display_name ?? participantB?.email ?? "Participante B";

  // Build participants map for ChatThread
  const participantsMap: Record<
    string,
    { id: string; display_name: string | null; email: string | null; role: "Empresa" | "Profissional" }
  > = {};
  if (participantA) {
    participantsMap[participantA.id] = {
      ...participantA,
      role: participantA.isContractor ? "Empresa" : "Profissional",
    };
  }
  if (participantB) {
    participantsMap[participantB.id] = {
      ...participantB,
      role: participantB.isContractor ? "Empresa" : "Profissional",
    };
  }

  return (
    <DetailPanel
      title={`${titleA} ↔ ${titleB}`}
      subtitle={
        chat.services
          ? `Serviço: ${chat.services.name}`
          : chat.leadId
          ? `Lead #${chat.leadId.slice(0, 8)}`
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
                      {i === 0 ? "Remetente" : "Destinatário"}
                    </p>
                    <Link
                      href={`/usuarios/${p.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {p.display_name ?? p.email ?? "—"}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {p.isContractor ? "Empresa" : "Profissional"}
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
