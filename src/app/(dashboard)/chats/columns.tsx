"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { formatRelativeTime, formatDate } from "@/lib/utils/format";
import type { ChatWithRelations } from "@/types/app";
import Link from "next/link";

export const columns: ColumnDef<ChatWithRelations>[] = [
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
    id: "vinculado",
    header: "Vinculado",
    cell: ({ row }) => {
      if (row.original.serviceId && row.original.services) {
        return (
          <Link
            href={`/servicos/${row.original.serviceId}`}
            className="text-primary hover:underline text-sm"
          >
            Serviço: {row.original.services.name ?? row.original.serviceId}
          </Link>
        );
      }
      if (row.original.leadId) {
        return (
          <Link
            href={`/leads/${row.original.leadId}`}
            className="text-primary hover:underline text-sm"
          >
            Lead #{row.original.leadId.slice(0, 8)}
          </Link>
        );
      }
      return <span className="text-muted-foreground text-sm">—</span>;
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data" />,
    cell: ({ row }) =>
      formatRelativeTime(row.original.last_message_at ?? row.original.created_at),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Criado em" />,
    cell: ({ row }) => formatDate(row.original.created_at),
  },
];
