"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { formatDate } from "@/lib/utils/format";
import { Trash2 } from "lucide-react";
import type { Notification } from "@/types/app";

interface NotificationColumnsProps {
  onDelete: (notification: Notification) => void;
  onToggleRead: (notification: Notification) => void;
}

export function getNotificationColumns({
  onDelete,
  onToggleRead,
}: NotificationColumnsProps): ColumnDef<Notification>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Título" />,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title ?? "—"}</span>
      ),
    },
    {
      accessorKey: "body",
      header: "Corpo",
      cell: ({ row }) => (
        <span className="text-muted-foreground line-clamp-1 max-w-xs">
          {row.original.body ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "userId",
      header: "Destinatário",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.userId ? row.original.userId.slice(0, 8) + "..." : "Sistema"}
        </span>
      ),
    },
    {
      id: "read",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.read ? "secondary" : "default"}>
          {row.original.read ? "Lido" : "Não lido"}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Criado em" />
      ),
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleRead(row.original)}
          >
            {row.original.read ? "Marcar não lido" : "Marcar lido"}
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
