"use client";

import { DetailPanel } from "@/components/record-detail/detail-panel";
import { FieldGrid } from "@/components/record-detail/field-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils/format";
import { SERVICE_CONDITIONS } from "@/lib/utils/constants";
import { ChevronDown, Star, X } from "lucide-react";
import { use } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ChatWithRelations } from "@/types/app";
import Link from "next/link";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_SERVICE = {
  id: "1",
  name: "Eletricista residencial",
  description:
    "Instalação elétrica completa para apartamento de 3 quartos. Necessário experiência com quadros de disjuntores modernos.",
  userId: "1",
  categoryId: "cat1",
  jobType: "Agendado",
  condition: "Opened",
  price: 2500,
  time: "4h",
  address: "Rua Augusta, 100 - Apto 42",
  cep: "01001-000",
  dateStart: "2025-06-01",
  dateEnd: "2025-06-05",
  candidated: 5,
  created_at: "2025-05-20T10:00:00Z",
  status: true,
  userAproved: null,
  skill: null,
  updated_at: null,
  endRegister: null,
  latLng: null,
};

const MOCK_CANDIDATES = [
  {
    id: "1",
    userId: "2",
    userName: "Maria Santos",
    aproved: true,
    description: "Tenho 5 anos de experiência com instalações elétricas.",
    created_at: "2025-05-21T08:00:00Z",
  },
  {
    id: "2",
    userId: "4",
    userName: "Ana Oliveira",
    aproved: false,
    description: "Disponível para começar imediatamente.",
    created_at: "2025-05-21T10:00:00Z",
  },
  {
    id: "3",
    userId: "6",
    userName: "Lucas Mendes",
    aproved: false,
    description: "Certificado NR10, trabalho com segurança.",
    created_at: "2025-05-22T14:00:00Z",
  },
];

const MOCK_RATING = {
  contractor_rating: 5,
  contractor_comment: "Excelente profissional, pontual e organizado.",
  prestador_rating: 4,
  prestador_comment: "Boa empresa, pagamento em dia.",
};

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
    id: "4",
    userIdA: "1",
    userIdB: "6",
    serviceId: "1",
    leadId: null,
    last_message: "Qual o melhor horário?",
    last_message_at: "2025-05-08T10:00:00Z",
    created_at: "2025-05-06T09:00:00Z",
    updated_at: null,
    userA: { id: "1", display_name: "João Silva", email: "joao@empresa.com" },
    userB: { id: "6", display_name: "Lucas Mendes", email: "lucas@email.com" },
    services: { id: "1", name: "Eletricista residencial" },
  },
];

const chatColumns: ColumnDef<ChatWithRelations>[] = [
  {
    id: "participantes",
    header: "Participantes",
    cell: ({ row }) => {
      const { userA, userB } = row.original;
      const a = userA?.display_name ?? userA?.email ?? "—";
      const b = userB?.display_name ?? userB?.email ?? "—";
      return (
        <Link href={`/chats/${row.original.id}`} className="hover:underline font-medium">
          {a} ↔ {b}
        </Link>
      );
    },
  },
  {
    accessorKey: "last_message",
    header: "Última Mensagem",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
        {row.original.last_message ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "last_message_at",
    header: "Data",
    cell: ({ row }) =>
      formatRelativeTime(row.original.last_message_at ?? row.original.created_at),
  },
  {
    accessorKey: "created_at",
    header: "Criado em",
    cell: ({ row }) => formatDate(row.original.created_at),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${
            i < value
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1.5 text-sm font-medium">{value}/5</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 16 — params is a Promise
  const { id } = use(params);

  // In production this would fetch by `id`. For now we use mock data.
  void id;
  const service = MOCK_SERVICE;
  const candidates = MOCK_CANDIDATES;
  const rating = MOCK_RATING;

  const conditionMeta =
    SERVICE_CONDITIONS[service.condition as keyof typeof SERVICE_CONDITIONS] ??
    SERVICE_CONDITIONS.Opened;

  const conditionBadge = (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${conditionMeta.color}`}
    >
      {conditionMeta.label}
    </span>
  );

  const actions = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Alterar condição
            <ChevronDown className="ml-1 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Condição do serviço</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(SERVICE_CONDITIONS).map(([key, meta]) => (
            <DropdownMenuItem key={key}>
              <span
                className={`mr-2 inline-block size-2 rounded-full ${meta.color.split(" ")[0]}`}
              />
              {meta.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
        <X className="mr-1 size-4" />
        Cancelar serviço
      </Button>
    </>
  );

  const infoFields = [
    { label: "Nome", value: service.name },
    { label: "Empresa (ID)", value: service.userId },
    { label: "Categoria", value: service.categoryId },
    { label: "Tipo", value: service.jobType },
    {
      label: "Status",
      value: conditionBadge,
    },
    { label: "Preço", value: formatCurrency(service.price) },
    { label: "Tempo estimado", value: service.time ?? "—" },
    { label: "Endereço", value: service.address ?? "—" },
    { label: "CEP", value: service.cep ?? "—" },
    { label: "Data início", value: formatDate(service.dateStart) },
    { label: "Data fim", value: formatDate(service.dateEnd) },
    {
      label: "Candidatos",
      value: service.candidated?.toString() ?? "0",
    },
    {
      label: "Criado em",
      value: formatDate(service.created_at),
    },
    {
      label: "Descrição",
      value: (
        <span className="block max-w-prose text-sm font-normal text-muted-foreground leading-relaxed">
          {service.description ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <DetailPanel
      backHref="/servicos"
      title={service.name}
      subtitle={conditionMeta.label}
      actions={actions}
    >
      <Tabs defaultValue="informacoes">
        <TabsList>
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
          <TabsTrigger value="candidaturas">
            Candidaturas ({candidates.length})
          </TabsTrigger>
          <TabsTrigger value="avaliacao">Avaliação</TabsTrigger>
          <TabsTrigger value="conversas">
            Conversas ({MOCK_CHATS.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Informações ───────────────────────────────────────── */}
        <TabsContent value="informacoes" className="pt-6">
          <Card>
            <CardContent>
              <FieldGrid fields={infoFields} columns={3} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Candidaturas ──────────────────────────────────────── */}
        <TabsContent value="candidaturas" className="pt-6">
          <div className="space-y-3">
            {candidates.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma candidatura registrada.
              </p>
            )}
            {candidates.map((candidate) => (
              <Card key={candidate.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{candidate.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(candidate.created_at)}
                      </p>
                      <p className="text-sm text-muted-foreground pt-1">
                        {candidate.description}
                      </p>
                    </div>
                    <Badge
                      className={
                        candidate.aproved
                          ? "bg-green-500/20 text-green-400 border-0"
                          : "bg-yellow-500/20 text-yellow-400 border-0"
                      }
                    >
                      {candidate.aproved ? "Aprovado" : "Pendente"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab 3: Avaliação ─────────────────────────────────────────── */}
        <TabsContent value="avaliacao" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Empresa avalia profissional */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Empresa → Profissional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <StarRating value={rating.contractor_rating} />
                <p className="text-sm text-muted-foreground italic">
                  &quot;{rating.contractor_comment}&quot;
                </p>
              </CardContent>
            </Card>

            {/* Profissional avalia empresa */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Profissional → Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <StarRating value={rating.prestador_rating} />
                <p className="text-sm text-muted-foreground italic">
                  &quot;{rating.prestador_comment}&quot;
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* ── Tab 4: Conversas ──────────────────────────────────────── */}
        <TabsContent value="conversas" className="pt-6">
          {MOCK_CHATS.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma conversa vinculada a este serviço.
            </p>
          ) : (
            <DataTable
              columns={chatColumns}
              data={MOCK_CHATS}
              searchKey="last_message"
              searchPlaceholder="Buscar por mensagem..."
            />
          )}
        </TabsContent>
      </Tabs>
    </DetailPanel>
  );
}
