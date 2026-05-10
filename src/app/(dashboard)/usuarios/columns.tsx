"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { getUserStatus, USER_STATUS } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/format";
import type { User } from "@/types/app";
import Link from "next/link";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "display_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
    cell: ({ row }) => (
      <Link href={`/usuarios/${row.original.id}`} className="font-medium hover:underline">
        {row.original.display_name ?? "—"}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  },
  {
    id: "tipo",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge variant={row.original.isContractor ? "default" : "secondary"}>
        {row.original.isContractor ? "Empresa" : "Profissional"}
      </Badge>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = getUserStatus(row.original);
      const config = USER_STATUS[status];
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs ${config.color}`}>
          {config.label}
        </span>
      );
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
    cell: ({ row }) =>
      row.original.rating ? `${row.original.rating.toFixed(1)} ⭐` : "—",
  },
  {
    accessorKey: "city",
    header: "Cidade",
    cell: ({ row }) => row.original.city ?? "—",
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Criado em" />,
    cell: ({ row }) => formatDate(row.original.created_at),
  },
];
