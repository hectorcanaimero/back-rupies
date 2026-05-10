"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCategoryColumns } from "./columns";
import { CategoryDialog } from "./category-dialog";
import type { Category } from "@/types/app";

// Mock data
const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Elétrica", status: true, created_at: "2025-01-10T00:00:00Z" },
  { id: "2", name: "Hidráulica", status: true, created_at: "2025-01-11T00:00:00Z" },
  { id: "3", name: "Pintura", status: false, created_at: "2025-01-12T00:00:00Z" },
  { id: "4", name: "Construção Civil", status: true, created_at: "2025-01-13T00:00:00Z" },
  { id: "5", name: "Jardinagem", status: true, created_at: "2025-01-14T00:00:00Z" },
];

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Load from Supabase on mount
  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });
        if (!error && data) setCategories(data);
      } catch {
        // fallback to mock
      }
    })();
  }, []);

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  }, []);

  const handleToggle = useCallback(async (category: Category) => {
    const newStatus = !category.status;
    try {
      // The generated Update type is generic — cast via any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = createClient() as any;
      await db
        .from("categories")
        .update({ status: newStatus })
        .eq("id", category.id);
    } catch {
      // continue optimistic update
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? { ...c, status: newStatus } : c))
    );
  }, []);

  const handleSave = useCallback(
    async (data: { name: string; status: boolean }, id?: string) => {
      try {
        // The generated Update/Insert types are generic — cast via any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = createClient() as any;
        if (id) {
          const { data: updated, error } = await db
            .from("categories")
            .update({ name: data.name, status: data.status })
            .eq("id", id)
            .select()
            .single();
          if (!error && updated) {
            setCategories((prev) =>
              prev.map((c) => (c.id === id ? (updated as Category) : c))
            );
            return;
          }
        } else {
          const { data: created, error } = await db
            .from("categories")
            .insert({ name: data.name, status: data.status })
            .select()
            .single();
          if (!error && created) {
            setCategories((prev) => [created as Category, ...prev]);
            return;
          }
        }
      } catch {
        // optimistic fallback
      }
      // Optimistic local update when Supabase fails
      if (id) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, name: data.name, status: data.status } : c
          )
        );
      } else {
        const tempCategory: Category = {
          id: crypto.randomUUID(),
          name: data.name,
          status: data.status,
          created_at: new Date().toISOString(),
        };
        setCategories((prev) => [tempCategory, ...prev]);
      }
    },
    []
  );

  const columns = getCategoryColumns({ onEdit: handleEdit, onToggle: handleToggle });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-sm text-muted-foreground">{categories.length} registros</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingCategory(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nova Categoria
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={categories}
        searchKey="name"
        searchPlaceholder="Buscar por nome..."
      />
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        onSave={handleSave}
      />
    </div>
  );
}
