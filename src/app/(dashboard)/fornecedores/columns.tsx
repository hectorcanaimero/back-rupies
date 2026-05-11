"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { formatDate } from "@/lib/utils/format";
import type { Provider } from "@/types/app";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

interface ProviderColumnsProps {
  onEdit: (item: Provider) => void;
  onToggle: (item: Provider) => void;
  onDelete: (item: Provider) => void;
  typeNames: Record<string, string>;
}

const SELECT_LABELS: Record<string, string> = {
  first: "1º",
  second: "2º",
  third: "3º",
};

export function getProviderColumns({ onEdit, onToggle, onDelete, typeNames }: ProviderColumnsProps): ColumnDef<Provider>[] {
  return [
    {
      accessorKey: "logo",
      header: "Logo",
      cell: ({ row }) =>
        row.original.logo ? (
          <img
            src={row.original.logo}
            alt={row.original.name ?? "Logo"}
            className="h-9 w-9 rounded-lg object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
            —
          </div>
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
      id: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
      accessorFn: (row) => (row.type ? typeNames[row.type] ?? "—" : "—"),
      cell: ({ row }) => {
        const typeName = row.original.type ? typeNames[row.original.type] : null;
        return typeName ? (
          <Badge variant="outline">{typeName}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      id: "select",
      header: "Posição",
      cell: ({ row }) => {
        const val = row.original.select;
        return val ? (
          <Badge variant="secondary">{SELECT_LABELS[val] ?? val}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      id: "social",
      header: "Redes",
      cell: ({ row }) => {
        const links = [
          { url: row.original.wa, label: "WA" },
          { url: row.original.ig, label: "IG" },
          { url: row.original.fb, label: "FB" },
          { url: row.original.web, label: "Web" },
        ].filter((l) => l.url);
        if (!links.length) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex gap-1.5">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.url!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            ))}
          </div>
        );
      },
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
