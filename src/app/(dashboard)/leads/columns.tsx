"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { LEAD_STATUS, type LeadStatus } from "@/lib/utils/constants";
import type { LeadWithUser } from "@/types/app";
import Link from "next/link";

export const columns: ColumnDef<LeadWithUser>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
    cell: ({ row }) => (
      <Link
        href={`/leads/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.title || "—"}
      </Link>
    ),
  },
  {
    id: "empresa",
    header: "Empresa",
    cell: ({ row }) =>
      row.original.users ? (
        <Link
          href={`/usuarios/${row.original.users.id}`}
          className="text-primary hover:underline text-sm"
        >
          {row.original.users.name || row.original.users.email || "—"}
        </Link>
      ) : (
        "—"
      ),
  },
  {
    accessorKey: "type_fornecedor",
    header: "Tipo Fornecedor",
    cell: ({ row }) => row.original.type_fornecedor ?? "—",
  },
  {
    accessorKey: "orcamento",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Orçamento" />,
    cell: ({ row }) =>
      row.original.orcamento != null
        ? formatCurrency(row.original.orcamento)
        : row.original.orcamento_faixa ?? "—",
  },
  {
    accessorKey: "qtd",
    header: "Qtd",
    cell: ({ row }) => row.original.qtd ?? "—",
  },
  {
    accessorKey: "prazo_retorno",
    header: "Prazo Retorno",
    cell: ({ row }) => formatDate(row.original.prazo_retorno),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "open" ? "default" : "secondary"}>
        {LEAD_STATUS[row.original.status as LeadStatus]?.label ?? row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Criado em" />,
    cell: ({ row }) => formatDate(row.original.created_at),
  },
];
