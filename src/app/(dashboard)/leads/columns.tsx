"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { LeadWithUser } from "@/types/app";
import Link from "next/link";

export const columns: ColumnDef<LeadWithUser>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
    cell: ({ row }) => (
      <Link
        href={`/leads/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.name ?? "—"}
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
          {row.original.users.display_name ?? row.original.users.email ?? "—"}
        </Link>
      ) : (
        "—"
      ),
  },
  {
    accessorKey: "type_supplier",
    header: "Tipo Fornecedor",
    cell: ({ row }) => row.original.type_supplier ?? "—",
  },
  {
    accessorKey: "budget",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Orçamento" />,
    cell: ({ row }) => formatCurrency(row.original.budget),
  },
  {
    accessorKey: "quantity",
    header: "Qtd",
    cell: ({ row }) => row.original.quantity ?? "—",
  },
  {
    accessorKey: "return_deadline",
    header: "Prazo Retorno",
    cell: ({ row }) => row.original.return_deadline ?? "—",
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.finished ? "secondary" : "default"}>
        {row.original.finished ? "Finalizado" : "Aberto"}
      </Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Criado em" />,
    cell: ({ row }) => formatDate(row.original.created_at),
  },
];
