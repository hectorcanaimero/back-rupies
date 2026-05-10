"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { SUBSCRIPTION_STATUS, BILLING_CYCLES, type SubscriptionStatus, type BillingCycle } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/format";
import type { SubscriptionWithRelations } from "@/types/app";
import Link from "next/link";

export const columns: ColumnDef<SubscriptionWithRelations>[] = [
  {
    id: "usuario",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Usuário" />,
    cell: ({ row }) => {
      const user = row.original.users;
      if (!user) return <span className="text-muted-foreground">—</span>;
      return (
        <div>
          <Link
            href={`/assinaturas/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {user.display_name ?? "—"}
          </Link>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      );
    },
  },
  {
    id: "plano",
    header: "Plano",
    cell: ({ row }) => {
      const plan = row.original.subscription_plans;
      return plan?.name ?? "—";
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusKey = row.original.status as SubscriptionStatus;
      const config = SUBSCRIPTION_STATUS[statusKey] ?? {
        label: row.original.status,
        color: "bg-gray-500/20 text-gray-400",
      };
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
        >
          {config.label}
        </span>
      );
    },
  },
  {
    accessorKey: "billing_cycle",
    header: "Ciclo",
    cell: ({ row }) => {
      const cycleKey = row.original.billing_cycle as BillingCycle;
      return BILLING_CYCLES[cycleKey]?.label ?? row.original.billing_cycle ?? "—";
    },
  },
  {
    id: "periodo",
    header: "Período Atual",
    cell: ({ row }) => {
      const start = formatDate(row.original.current_period_start);
      const end = formatDate(row.original.current_period_end);
      if (start === "—" && end === "—") return "—";
      return (
        <span className="text-xs">
          {start} → {end}
        </span>
      );
    },
  },
  {
    accessorKey: "asaas_subscription_id",
    header: "Asaas ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.asaas_subscription_id ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Criado em" />,
    cell: ({ row }) => formatDate(row.original.created_at),
  },
];
