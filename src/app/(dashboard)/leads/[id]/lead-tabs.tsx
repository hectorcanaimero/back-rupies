"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FieldGrid } from "@/components/record-detail";
import { formatCurrency, formatDateTime, formatDate } from "@/lib/utils/format";
import { LEAD_STATUS, type LeadStatus } from "@/lib/utils/constants";
import type { Lead, LeadContact, User } from "@/types/app";
import Link from "next/link";
import { Users } from "lucide-react";

export interface LeadContactWithUser extends LeadContact {
  users: Pick<User, "id" | "name" | "email"> | null;
}

interface LeadTabsProps {
  lead: Lead;
  contacts: LeadContactWithUser[];
  empresa: Pick<User, "id" | "name" | "email"> | null;
}

export function LeadTabs({ lead, contacts, empresa }: LeadTabsProps) {
  const informacoesFields = [
    { label: "Título", value: lead.title || "—" },
    {
      label: "Empresa",
      value: empresa ? (
        <Link href={`/usuarios/${empresa.id}`} className="text-primary hover:underline">
          {empresa.name || empresa.email || "—"}
        </Link>
      ) : "—",
    },
    { label: "Tipo de Fornecedor", value: lead.type_fornecedor ?? "—" },
    {
      label: "Orçamento",
      value: lead.orcamento != null ? formatCurrency(lead.orcamento) : lead.orcamento_faixa ?? "—",
    },
    { label: "Quantidade", value: lead.qtd != null ? String(lead.qtd) : "—" },
    { label: "Prazo de Retorno", value: formatDate(lead.prazo_retorno) },
    { label: "Data do Evento", value: formatDate(lead.event_date) },
    {
      label: "Cidade/Estado",
      value: lead.city && lead.state ? `${lead.city}, ${lead.state}` : "—",
    },
    { label: "Perfil do Público", value: lead.perfil_publico ?? "—" },
    { label: "Expectativa", value: lead.expectativa ?? "—" },
    {
      label: "Status",
      value: (
        <Badge variant={lead.status === "open" ? "default" : "secondary"}>
          {LEAD_STATUS[lead.status as LeadStatus]?.label ?? lead.status}
        </Badge>
      ),
    },
    { label: "Criado em", value: formatDateTime(lead.created_at) },
    { label: "Descrição", value: lead.description ?? "—" },
  ];

  return (
    <Tabs defaultValue="informacoes">
      <TabsList>
        <TabsTrigger value="informacoes">Informações</TabsTrigger>
        <TabsTrigger value="contatos">
          Contatos ({contacts.length})
        </TabsTrigger>
      </TabsList>

      {/* Tab: Informações */}
      <TabsContent value="informacoes">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhes do Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGrid fields={informacoesFields} columns={2} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Contatos interessados */}
      <TabsContent value="contatos">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contatos Interessados ({contacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum contato registrado.</p>
            ) : (
              <div className="divide-y">
                {contacts.map((contact) => (
                  <div key={contact.id} className="py-3 flex items-start justify-between">
                    <div>
                      {contact.users ? (
                        <Link
                          href={`/usuarios/${contact.users.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {contact.users.name || contact.users.email}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium">—</p>
                      )}
                      <p className="text-xs text-muted-foreground">{contact.message ?? "—"}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(contact.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

    </Tabs>
  );
}
