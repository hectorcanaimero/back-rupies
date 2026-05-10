"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { formatCurrency } from "@/lib/utils/format";
import type { SubscriptionPlan } from "@/types/app";
import { Pencil, Eye } from "lucide-react";
import Link from "next/link";

interface PlanColumnsProps {
  onEdit: (plan: SubscriptionPlan) => void;
}

export function getPlanColumns({ onEdit }: PlanColumnsProps): ColumnDef<SubscriptionPlan>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
      cell: ({ row }) => (
        <Link
          href={`/planos/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "price_monthly",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Preço Mensal" />,
      cell: ({ row }) => formatCurrency(row.original.price_monthly),
    },
    {
      accessorKey: "price_yearly",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Preço Anual" />,
      cell: ({ row }) => formatCurrency(row.original.price_yearly),
    },
    {
      accessorKey: "credits_per_month",
      header: "Créditos/mês",
      cell: ({ row }) =>
        row.original.is_unlimited
          ? "Ilimitado"
          : (row.original.credits_per_month ?? "—"),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.type ?? row.original.plan_type ?? "—"}</Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/planos/${row.original.id}`}>
              <Eye className="h-3.5 w-3.5 mr-1" />
              Ver
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Editar
          </Button>
        </div>
      ),
    },
  ];
}
