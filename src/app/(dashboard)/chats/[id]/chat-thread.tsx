"use client";

import { formatDateTime } from "@/lib/utils/format";
import type { ChatMessage } from "@/types/app";
import { cn } from "@/lib/utils";
import { Volume2, ImageIcon, MessageSquare } from "lucide-react";

interface Participant {
  id: string;
  display_name: string | null;
  email: string | null;
  role: "Empresa" | "Profissional";
}

interface ChatThreadProps {
  messages: ChatMessage[];
  participants: Record<string, Participant>;
}

function MessageBubble({
  message,
  participant,
  isRight,
}: {
  message: ChatMessage;
  participant: Participant | undefined;
  isRight: boolean;
}) {
  const name = participant?.display_name ?? participant?.email ?? "Usuário";
  const role = participant?.role ?? "—";

  function renderContent() {
    if (message.type === "image") {
      return (
        <div className="space-y-1">
          {message.media_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={message.media_url}
              alt="Imagem"
              className="rounded-md max-w-[240px] max-h-[180px] object-cover"
            />
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <ImageIcon className="h-4 w-4" />
              Imagem
            </div>
          )}
          {message.content && (
            <p className="text-sm">{message.content}</p>
          )}
        </div>
      );
    }
    if (message.type === "audio") {
      return (
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          {message.media_url ? (
            <audio controls src={message.media_url} className="h-8 max-w-[200px]" />
          ) : (
            <span className="text-sm text-muted-foreground">Áudio</span>
          )}
        </div>
      );
    }
    return <p className="text-sm whitespace-pre-wrap">{message.content ?? "—"}</p>;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1 max-w-[70%]",
        isRight ? "items-end ml-auto" : "items-start"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium">{name}</span>
        <span className="text-xs text-muted-foreground">({role})</span>
      </div>
      <div
        className={cn(
          "rounded-xl px-3.5 py-2.5",
          isRight
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        {renderContent()}
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span>{formatDateTime(message.created_at)}</span>
        {message.read && (
          <span className="text-blue-400">Lido</span>
        )}
      </div>
    </div>
  );
}

export function ChatThread({ messages, participants }: ChatThreadProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
        <MessageSquare className="h-8 w-8" />
        <p className="text-sm">Nenhuma mensagem nesta conversa.</p>
      </div>
    );
  }

  // First sender is shown on the right (Empresa perspective)
  const firstSenderId = messages[0]?.senderId;

  return (
    <div className="flex flex-col gap-4 py-2">
      {messages.map((message) => {
        const participant = message.senderId ? participants[message.senderId] : undefined;
        const isRight = message.senderId === firstSenderId;
        return (
          <MessageBubble
            key={message.id}
            message={message}
            participant={participant}
            isRight={isRight}
          />
        );
      })}
    </div>
  );
}
