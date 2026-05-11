"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { formatDate } from "@/lib/utils/format";
import type { TypeProvider } from "@/types/app";
import { Pencil, Trash2 } from "lucide-react";

interface TypeProviderColumnsProps {
  onEdit: (item: TypeProvider) => void;
  onToggle: (item: TypeProvider) => void;
  onDelete: (item: TypeProvider) => void;
}

export function getTypeProviderColumns({ onEdit, onToggle, onDelete }: TypeProviderColumnsProps): ColumnDef<TypeProvider>[] {
  return [
    {
      accessorKey: "icon",
      header: "Ícone",
      cell: ({ row }) =>
        row.original.icon ? (
          <img
            src={row.original.icon}
            alt={row.original.name ?? "Ícone"}
            className="h-9 w-9 rounded-lg object-cover"
          />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name ?? "—"}</span>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Categoria" />,
      cell: ({ row }) =>
        row.original.category ? (
          <Badge variant="outline">{row.original.category}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status ? "default" : "secondary"}>
          {row.original.status ? "Ativo" : "Inativo"}
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
          <Button variant="ghost" size="sm" className="w-24 justify-start" onClick={() => onToggle(row.original)}>
            {row.original.status ? "Desativar" : "Ativar"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
