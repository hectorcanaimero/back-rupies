"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { formatDate, formatCredits } from "@/lib/utils/format";
import type { CreditBalanceWithUser } from "@/types/app";
import Link from "next/link";

const BALANCE_KIND: Record<string, string> = { purchase: "Compra", weekly_grant: "Semanal" };

export const columns: ColumnDef<CreditBalanceWithUser>[] = [
  {
    id: "usuario",
    accessorFn: (b) => `${b.users?.name ?? ""} ${b.users?.email ?? ""}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Usuário" />,
    cell: ({ row }) => {
      const user = row.original.users;
      if (!user) return <span className="text-muted-foreground">—</span>;
      return (
        <div>
          <Link
            href={`/creditos/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {user.name || "—"}
          </Link>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      );
    },
  },
  {
    id: "periodo",
    header: "Período",
    cell: ({ row }) => (
      <span className="text-xs">
        {formatDate(row.original.period_start)} → {formatDate(row.original.period_end)}
      </span>
    ),
  },
  {
    accessorKey: "credits_granted",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Concedidos" />,
    cell: ({ row }) =>
      <span className="tabular-nums">{row.original.credits_granted}</span>,
  },
  {
    accessorKey: "credits_used",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Usados" />,
    cell: ({ row }) =>
      <span className="tabular-nums text-orange-400">{row.original.credits_used ?? 0}</span>,
  },
  {
    accessorKey: "credits_remaining",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Restantes" />,
    cell: ({ row }) =>
      <span className="tabular-nums text-green-400">{row.original.credits_remaining ?? 0}</span>,
  },
  {
    id: "kind",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge variant="secondary">{BALANCE_KIND[row.original.kind] ?? row.original.kind}</Badge>
    ),
  },
  {
    id: "situacao",
    header: "Situação",
    cell: ({ row }) => {
      const remaining = row.original.credits_remaining ?? 0;
      if (remaining === 0) {
        return (
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400">
            Esgotado
          </span>
        );
      }
      return (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400">
          Ativo
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Criado em" />,
    cell: ({ row }) => formatDate(row.original.created_at),
  },
];
