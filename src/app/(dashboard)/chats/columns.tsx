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
    accessorFn: (c) => `${c.userA?.name ?? ""} ${c.userA?.email ?? ""} ${c.userB?.name ?? ""} ${c.userB?.email ?? ""}`,
    cell: ({ row }) => {
      const { userA, userB } = row.original;
      const a = userA?.name || userA?.email || "—";
      const b = userB?.name || userB?.email || "—";
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
      if (row.original.service_id && row.original.services) {
        return (
          <Link
            href={`/servicos/${row.original.service_id}`}
            className="text-primary hover:underline text-sm"
          >
            Serviço: {row.original.services.title || row.original.service_id}
          </Link>
        );
      }
      if (row.original.lead_id) {
        return (
          <Link
            href={`/leads/${row.original.lead_id}`}
            className="text-primary hover:underline text-sm"
          >
            Lead #{row.original.lead_id.slice(0, 8)}
          </Link>
        );
      }
      return <span className="text-muted-foreground text-sm">—</span>;
    },
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
