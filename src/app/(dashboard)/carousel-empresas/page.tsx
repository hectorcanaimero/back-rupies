"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCarouselColumns } from "./columns";
import { CarouselDialog } from "./carousel-dialog";
import type { ExternalBanner } from "@/types/app";

export default function CarouselEmpresasPage() {
  const [items, setItems] = useState<ExternalBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExternalBanner | null>(null);

  const fetchItems = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("external_banner")
      .select("*")
      .order("order", { ascending: true });
    if (!error && data) setItems(data as ExternalBanner[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleEdit = useCallback((item: ExternalBanner) => {
    setEditingItem(item);
    setDialogOpen(true);
  }, []);

  const handleToggle = useCallback(async (item: ExternalBanner) => {
    const newStatus = !item.status;
    setItems((prev) =>
      prev.map((b) => (b.id === item.id ? { ...b, status: newStatus } : b))
    );
    const supabase = createClient();
    const { error } = await supabase
      .from("external_banner")
      .update({ status: newStatus } as never)
      .eq("id", item.id);
    if (error) {
      setItems((prev) =>
        prev.map((b) => (b.id === item.id ? { ...b, status: item.status } : b))
      );
    }
  }, []);

  const handleDelete = useCallback(async (item: ExternalBanner) => {
    if (!confirm("Excluir este item do carousel?")) return;
    setItems((prev) => prev.filter((b) => b.id !== item.id));
    const supabase = createClient();
    const { error } = await supabase
      .from("external_banner")
      .delete()
      .eq("id", item.id);
    if (error) {
      setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    }
  }, []);

  const handleSave = useCallback(
    async (
      data: {
        image: string;
        url: string;
        text_button: string;
        color_button: string;
        color_text: string;
        order: number;
        status: boolean;
        start: string | null;
        end: string | null;
      },
      id?: string
    ) => {
      const supabase = createClient();
      if (id) {
        const { data: updated, error } = await supabase
          .from("external_banner")
          .update(data as never)
          .eq("id", id)
          .select()
          .single();
        if (!error && updated) {
          setItems((prev) => prev.map((b) => (b.id === id ? (updated as ExternalBanner) : b)));
        }
      } else {
        const { data: created, error } = await supabase
          .from("external_banner")
          .insert(data as never)
          .select()
          .single();
        if (!error && created) {
          setItems((prev) => [...prev, created as ExternalBanner].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        }
      }
    },
    []
  );

  const columns = getCarouselColumns({ onEdit: handleEdit, onToggle: handleToggle, onDelete: handleDelete });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Carousel Empresas</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Carregando..." : `${items.length} registros`}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingItem(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Novo Item
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={items}
        searchKey="text_button"
        searchPlaceholder="Buscar por texto do botão..."
      />
      <CarouselDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        onSave={handleSave}
      />
    </div>
  );
}
