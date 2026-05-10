"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getBannerColumns } from "./columns";
import { BannerDialog } from "./banner-dialog";
import type { Banner } from "@/types/app";

const MOCK_BANNERS: Banner[] = [
  {
    id: "1",
    title: "Promoção de Verão",
    image_url: "https://placehold.co/800x300",
    link: "https://rupies.com.br",
    order: 1,
    active: true,
    type: "banner",
    created_at: "2025-12-01T00:00:00Z",
    updated_at: null,
  },
  {
    id: "2",
    title: "Parceiro Externo",
    image_url: "https://placehold.co/800x300",
    link: "https://parceiro.com",
    order: 2,
    active: false,
    type: "external",
    created_at: "2025-12-15T00:00:00Z",
    updated_at: null,
  },
  {
    id: "3",
    title: "Black Friday",
    image_url: "https://placehold.co/800x300",
    link: "https://rupies.com.br/promo",
    order: 3,
    active: true,
    type: "banner",
    created_at: "2025-11-01T00:00:00Z",
    updated_at: null,
  },
];

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>(MOCK_BANNERS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("banners")
          .select("*")
          .order("order", { ascending: true });
        if (!error && data) setBanners(data);
      } catch {
        // fallback to mock
      }
    })();
  }, []);

  const handleEdit = useCallback((banner: Banner) => {
    setEditingBanner(banner);
    setDialogOpen(true);
  }, []);

  const handleToggle = useCallback(async (banner: Banner) => {
    const newActive = !banner.active;
    try {
      const supabase = createClient();
      // The generated Update type is generic — cast via unknown
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      await db.from("banners").update({ active: newActive }).eq("id", banner.id);
    } catch {
      // optimistic
    }
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, active: newActive } : b))
    );
  }, []);

  const handleSave = useCallback(
    async (
      data: { title: string; image_url: string; link: string; order: number; type: string; active: boolean },
      id?: string
    ) => {
      try {
        // The generated Update/Insert types are generic — cast via any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = createClient() as any;
        if (id) {
          const { data: updated, error } = await db
            .from("banners")
            .update(data)
            .eq("id", id)
            .select()
            .single();
          if (!error && updated) {
            setBanners((prev) => prev.map((b) => (b.id === id ? (updated as Banner) : b)));
            return;
          }
        } else {
          const { data: created, error } = await db
            .from("banners")
            .insert(data)
            .select()
            .single();
          if (!error && created) {
            setBanners((prev) => [created as Banner, ...prev]);
            return;
          }
        }
      } catch {
        // fallback
      }
      if (id) {
        setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
      } else {
        const temp: Banner = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: null,
          ...data,
        };
        setBanners((prev) => [temp, ...prev]);
      }
    },
    []
  );

  const columns = getBannerColumns({ onEdit: handleEdit, onToggle: handleToggle });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banners</h1>
          <p className="text-sm text-muted-foreground">{banners.length} registros</p>
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
        searchKey="title"
        searchPlaceholder="Buscar por título..."
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
