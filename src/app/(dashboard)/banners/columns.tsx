"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { formatDate } from "@/lib/utils/format";
import type { Banner } from "@/types/app";
import { Pencil } from "lucide-react";

interface BannerColumnsProps {
  onEdit: (banner: Banner) => void;
  onToggle: (banner: Banner) => void;
}

export function getBannerColumns({ onEdit, onToggle }: BannerColumnsProps): ColumnDef<Banner>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Título" />,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title ?? "—"}</span>
      ),
    },
    {
      id: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.type === "external" ? "Externo" : "Banner"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "default" : "secondary"}>
          {row.original.active ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      accessorKey: "order",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ordem" />,
      cell: ({ row }) => row.original.order ?? "—",
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Criado em" />,
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onToggle(row.original)}>
            {row.original.active ? "Desativar" : "Ativar"}
          </Button>
        </div>
      ),
    },
  ];
}
