"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getBannerColumns } from "./columns";
import { BannerDialog } from "./banner-dialog";
import type { Banner } from "@/types/app";

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const fetchBanners = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("position", { ascending: true });
    if (!error && data) setBanners(data as Banner[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleEdit = useCallback((banner: Banner) => {
    setEditingBanner(banner);
    setDialogOpen(true);
  }, []);

  const handleToggle = useCallback(async (banner: Banner) => {
    const newStatus = !banner.status;
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, status: newStatus } : b))
    );
    const supabase = createClient();
    const { error } = await supabase
      .from("banners")
      .update({ status: newStatus } as never)
      .eq("id", banner.id);
    if (error) {
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, status: banner.status } : b))
      );
    }
  }, []);

  const handleDelete = useCallback(async (banner: Banner) => {
    if (!confirm(`Excluir este banner?`)) return;
    setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    const supabase = createClient();
    const { error } = await supabase
      .from("banners")
      .delete()
      .eq("id", banner.id);
    if (error) {
      setBanners((prev) => [...prev, banner].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
    }
  }, []);

  const handleSave = useCallback(
    async (
      data: {
        image: string;
        url: string;
        position: number;
        status: boolean;
        dateStart: string | null;
        dateEnd: string | null;
        device: string[];
      },
      id?: string
    ) => {
      const supabase = createClient();
      if (id) {
        const { data: updated, error } = await supabase
          .from("banners")
          .update(data as never)
          .eq("id", id)
          .select()
          .single();
        if (!error && updated) {
          setBanners((prev) => prev.map((b) => (b.id === id ? (updated as Banner) : b)));
        }
      } else {
        const { data: created, error } = await supabase
          .from("banners")
          .insert(data as never)
          .select()
          .single();
        if (!error && created) {
          setBanners((prev) => [...prev, created as Banner].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
        }
      }
    },
    []
  );

  const columns = getBannerColumns({ onEdit: handleEdit, onToggle: handleToggle, onDelete: handleDelete });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banners</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Carregando..." : `${banners.length} registros`}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingBanner(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Novo Banner
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={banners}
        searchKey="url"
        searchPlaceholder="Buscar por URL..."
      />
      <BannerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        banner={editingBanner}
        onSave={handleSave}
      />
    </div>
  );
}
