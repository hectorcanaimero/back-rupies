"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCategoryColumns } from "./columns";
import { CategoryDialog } from "./category-dialog";
import type { Category } from "@/types/app";

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    createClient()
      .from("rp_categories")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  }, []);

  const handleToggle = useCallback(async (category: Category) => {
    const { data, error } = await createClient()
      .from("rp_categories")
      .update({ active: !category.active })
      .eq("id", category.id)
      .select()
      .single();
    if (error) return alert(`Erro ao salvar: ${error.message}`);
    setCategories((prev) => prev.map((c) => (c.id === category.id ? data : c)));
  }, []);

  const handleSave = useCallback(async (input: { name: string; active: boolean }, id?: string) => {
    const db = createClient().from("rp_categories");
    const { data, error } = id
      ? await db.update(input).eq("id", id).select().single()
      : await db.insert(input).select().single();
    if (error) return alert(`Erro ao salvar: ${error.message}`);
    setCategories((prev) =>
      id ? prev.map((c) => (c.id === id ? data : c)) : [data, ...prev]
    );
  }, []);

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
