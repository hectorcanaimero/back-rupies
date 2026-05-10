"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FieldGrid } from "@/components/record-detail";
import { formatCurrency, formatDateTime, formatDate } from "@/lib/utils/format";
import type { Lead, LeadContact, LeadAttachment } from "@/types/app";
import Link from "next/link";
import { FileText, Paperclip, Users } from "lucide-react";

interface LeadTabsProps {
  lead: Lead;
  contacts: LeadContact[];
  attachments: LeadAttachment[];
  empresa: { id: string; display_name: string | null; email: string | null } | null;
}

export function LeadTabs({ lead, contacts, attachments, empresa }: LeadTabsProps) {
  const informacoesFields = [
    { label: "Nome", value: lead.name ?? "—" },
    {
      label: "Empresa",
      value: empresa ? (
        <Link href={`/usuarios/${empresa.id}`} className="text-primary hover:underline">
          {empresa.display_name ?? empresa.email ?? "—"}
        </Link>
      ) : "—",
    },
    { label: "Tipo de Fornecedor", value: lead.type_supplier ?? "—" },
    { label: "Orçamento", value: formatCurrency(lead.budget) },
    { label: "Quantidade", value: lead.quantity != null ? String(lead.quantity) : "—" },
    { label: "Prazo de Retorno", value: lead.return_deadline ?? "—" },
    {
      label: "Status",
      value: (
        <Badge variant={lead.finished ? "secondary" : "default"}>
          {lead.finished ? "Finalizado" : "Aberto"}
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
        <TabsTrigger value="anexos">
          Anexos ({attachments.length})
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
                      <p className="text-sm font-medium">{contact.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {contact.email ?? "—"} · {contact.phone ?? "—"}
                      </p>
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

      {/* Tab: Anexos */}
      <TabsContent value="anexos">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Anexos ({attachments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum anexo encontrado.</p>
            ) : (
              <div className="divide-y">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{attachment.name ?? "Arquivo"}</p>
                        <p className="text-xs text-muted-foreground">{attachment.type ?? "—"}</p>
                      </div>
                    </div>
                    {attachment.url && (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Abrir
                      </a>
                    )}
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
