"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { formatDate } from "@/lib/utils/format";
import type { Sac } from "@/types/app";
import { Pencil, Trash2 } from "lucide-react";

interface FaqColumnsProps {
  onEdit: (faq: Sac) => void;
  onDelete: (faq: Sac) => void;
}

export function getFaqColumns({ onEdit, onDelete }: FaqColumnsProps): ColumnDef<Sac>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Título" />,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title ?? "—"}</span>
      ),
    },
    {
      accessorKey: "content",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Conteúdo" />,
      cell: ({ row }) => {
        const content = row.original.content ?? "";
        return (
          <span className="text-muted-foreground text-sm">
            {content.length > 80 ? content.slice(0, 80) + "…" : content || "—"}
          </span>
        );
      },
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
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Excluir
          </Button>
        </div>
      ),
    },
  ];
}
