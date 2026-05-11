"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { formatDate } from "@/lib/utils/format";
import type { ExternalBanner } from "@/types/app";
import { Pencil, Trash2 } from "lucide-react";

interface CarouselColumnsProps {
  onEdit: (item: ExternalBanner) => void;
  onToggle: (item: ExternalBanner) => void;
  onDelete: (item: ExternalBanner) => void;
}

export function getCarouselColumns({ onEdit, onToggle, onDelete }: CarouselColumnsProps): ColumnDef<ExternalBanner>[] {
  return [
    {
      accessorKey: "image",
      header: "Imagem",
      cell: ({ row }) =>
        row.original.image ? (
          <img
            src={row.original.image}
            alt="Carousel"
            className="h-10 w-20 rounded object-cover"
          />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "text_button",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Botão" />,
      cell: ({ row }) => {
        const text = row.original.text_button;
        const bgColor = row.original.color_button;
        const textColor = row.original.color_text;
        if (!text) return <span className="text-muted-foreground">—</span>;
        return (
          <span
            className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold"
            style={{ backgroundColor: bgColor ?? undefined, color: textColor ?? undefined }}
          >
            {text}
          </span>
        );
      },
    },
    {
      accessorKey: "url",
      header: ({ column }) => <DataTableColumnHeader column={column} title="URL" />,
      cell: ({ row }) =>
        row.original.url ? (
          <a
            href={row.original.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline truncate max-w-[200px] inline-block"
          >
            {row.original.url}
          </a>
        ) : (
          "—"
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
      id: "period",
      header: "Período",
      cell: ({ row }) => {
        const start = row.original.start;
        const end = row.original.end;
        if (!start && !end) return <span className="text-muted-foreground">Sem período</span>;
        return (
          <span className="text-sm">
            {start ? formatDate(start) : "—"} → {end ? formatDate(end) : "—"}
          </span>
        );
      },
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
