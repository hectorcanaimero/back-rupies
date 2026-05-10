"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { SERVICE_CONDITIONS, JOB_TYPES } from "@/lib/utils/constants";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import type { Service } from "@/types/app";
import Link from "next/link";

export const columns: ColumnDef<Service>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
    cell: ({ row }) => (
      <Link href={`/servicos/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name ?? "—"}
      </Link>
    ),
  },
  {
    id: "condition",
    header: "Status",
    cell: ({ row }) => {
      const condition = row.original.condition as keyof typeof SERVICE_CONDITIONS | null;
      if (!condition || !SERVICE_CONDITIONS[condition]) return "—";
      const config = SERVICE_CONDITIONS[condition];
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs ${config.color}`}>
          {config.label}
        </span>
      );
    },
  },
  {
    id: "jobType",
    header: "Tipo",
    cell: ({ row }) => {
      const jobType = row.original.jobType as keyof typeof JOB_TYPES | null;
      if (!jobType || !JOB_TYPES[jobType]) return "—";
      const config = JOB_TYPES[jobType];
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs ${config.color}`}>
          {config.label}
        </span>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Preço" />,
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  {
    accessorKey: "candidated",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Candidatos" />,
    cell: ({ row }) => row.original.candidated ?? 0,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Criado em" />,
    cell: ({ row }) => formatDate(row.original.created_at),
  },
];
