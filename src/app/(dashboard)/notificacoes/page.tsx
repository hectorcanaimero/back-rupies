"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getNotificationColumns } from "./columns";
import { NotificationDialog } from "./notification-dialog";
import type { Notification } from "@/types/app";

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    userId: null,
    title: "Bem-vindo ao Rupies!",
    body: "Complete seu perfil para começar a usar a plataforma.",
    read: false,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    userId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    title: "Candidatura aprovada",
    body: "Você foi selecionado para o serviço de Elétrica.",
    read: true,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    userId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    title: "Créditos esgotando",
    body: "Você tem apenas 2 créditos restantes neste período.",
    read: false,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) setNotifications(data as Notification[]);
      } catch {
        // fallback to mock
      }
    })();
  }, []);

  const handleToggleRead = useCallback(async (notification: Notification) => {
    const newRead = !notification.read;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = createClient() as any;
      await db
        .from("notifications")
        .update({ read: newRead })
        .eq("id", notification.id);
    } catch {
      // optimistic update
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: newRead } : n))
    );
  }, []);

  const handleDelete = useCallback(async (notification: Notification) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = createClient() as any;
      await db.from("notifications").delete().eq("id", notification.id);
    } catch {
      // optimistic delete
    }
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
  }, []);

  const handleCreate = useCallback(
    async (data: { title: string; body: string; userId?: string }) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = createClient() as any;
        const { data: created, error } = await db
          .from("notifications")
          .insert({
            title: data.title,
            body: data.body,
            userId: data.userId ?? null,
            read: false,
          })
          .select()
          .single();
        if (!error && created) {
          setNotifications((prev) => [created as Notification, ...prev]);
          return;
        }
      } catch {
        // optimistic fallback
      }
      const temp: Notification = {
        id: crypto.randomUUID(),
        title: data.title,
        body: data.body,
        userId: data.userId ?? null,
        read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [temp, ...prev]);
    },
    []
  );

  const columns = getNotificationColumns({
    onDelete: handleDelete,
    onToggleRead: handleToggleRead,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-sm text-muted-foreground">
            {notifications.length} registros · {unreadCount} não lidas
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nova Notificação
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={notifications}
        searchKey="title"
        searchPlaceholder="Buscar por título..."
      />
      <NotificationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleCreate}
      />
    </div>
  );
}
