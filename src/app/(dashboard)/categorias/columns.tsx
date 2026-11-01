"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import type { Category } from "@/types/app";
import { Pencil } from "lucide-react";

interface CategoryColumnsProps {
  onEdit: (category: Category) => void;
  onToggle: (category: Category) => void;
}

export function getCategoryColumns({ onEdit, onToggle }: CategoryColumnsProps): ColumnDef<Category>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name || "—"}</span>
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
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(row.original)}
          >
            {row.original.active ? "Desativar" : "Ativar"}
          </Button>
        </div>
      ),
    },
  ];
}
