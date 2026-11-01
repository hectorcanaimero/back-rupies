"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getNotificationColumns } from "./columns";
import { NotificationDialog } from "./notification-dialog";
import type { Notification } from "@/types/app";

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    createClient()
      .from("rp_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000)
      .then(({ data }) => setNotifications(data ?? []));
  }, []);

  const handleToggleRead = useCallback(async (notification: Notification) => {
    const { data, error } = await createClient()
      .from("rp_notifications")
      .update({ read: !notification.read })
      .eq("id", notification.id)
      .select()
      .single();
    if (error) return alert(`Erro ao salvar: ${error.message}`);
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? data : n)));
  }, []);

  const handleDelete = useCallback(async (notification: Notification) => {
    const { error } = await createClient().from("rp_notifications").delete().eq("id", notification.id);
    if (error) return alert(`Erro ao excluir: ${error.message}`);
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
  }, []);

  const handleCreate = useCallback(
    async (input: { title: string; body: string; userId: string }) => {
      const { data, error } = await createClient()
        .from("rp_notifications")
        .insert({ title: input.title, body: input.body, user_id: input.userId })
        .select()
        .single();
      if (error) return alert(`Erro ao salvar: ${error.message}`);
      setNotifications((prev) => [data, ...prev]);
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
