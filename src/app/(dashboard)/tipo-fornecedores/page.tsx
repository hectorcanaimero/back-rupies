"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { getTypeProviderColumns } from "./columns";
import { TypeProviderDialog } from "./type-provider-dialog";
import type { TypeProvider } from "@/types/app";

const CATEGORIES = [
  { value: "Produtos para comprar", label: "Produtos para comprar" },
  { value: "Produtos para Locação", label: "Produtos para Locação" },
] as const;

export default function TipoFornecedoresPage() {
  const [items, setItems] = useState<TypeProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TypeProvider | null>(null);
  const [activeTab, setActiveTab] = useState<string>(CATEGORIES[0].value);

  const fetchItems = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("type_provider")
      .select("*")
      .order("order", { ascending: true });
    if (!error && data) setItems(data as TypeProvider[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleEdit = useCallback((item: TypeProvider) => {
    setEditingItem(item);
    setDialogOpen(true);
  }, []);

  const handleToggle = useCallback(async (item: TypeProvider) => {
    const newStatus = !item.status;
    setItems((prev) =>
      prev.map((b) => (b.id === item.id ? { ...b, status: newStatus } : b))
    );
    const supabase = createClient();
    const { error } = await supabase
      .from("type_provider")
      .update({ status: newStatus } as never)
      .eq("id", item.id);
    if (error) {
      setItems((prev) =>
        prev.map((b) => (b.id === item.id ? { ...b, status: item.status } : b))
      );
    }
  }, []);

  const handleDelete = useCallback(async (item: TypeProvider) => {
    if (!confirm(`Excluir "${item.name}"?`)) return;
    setItems((prev) => prev.filter((b) => b.id !== item.id));
    const supabase = createClient();
    const { error } = await supabase
      .from("type_provider")
      .delete()
      .eq("id", item.id);
    if (error) {
      setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    }
  }, []);

  const handleSave = useCallback(
    async (
      data: {
        name: string;
        icon: string;
        banner: string;
        url: string;
        order: number;
        status: boolean;
        category: string;
      },
      id?: string
    ) => {
      const supabase = createClient();
      if (id) {
        const { data: updated, error } = await supabase
          .from("type_provider")
          .update(data as never)
          .eq("id", id)
          .select()
          .single();
        if (!error && updated) {
          setItems((prev) => prev.map((b) => (b.id === id ? (updated as TypeProvider) : b)));
        }
      } else {
        const { data: created, error } = await supabase
          .from("type_provider")
          .insert(data as never)
          .select()
          .single();
        if (!error && created) {
          setItems((prev) => [...prev, created as TypeProvider].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        }
      }
    },
    []
  );

  const columns = getTypeProviderColumns({ onEdit: handleEdit, onToggle: handleToggle, onDelete: handleDelete });

  const itemsByCategory = useMemo(() => {
    const map: Record<string, TypeProvider[]> = {};
    for (const cat of CATEGORIES) {
      map[cat.value] = items.filter((i) => i.category === cat.value);
    }
    return map;
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tipo de Fornecedores</h1>
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
          Novo Tipo
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
              <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                ({itemsByCategory[cat.value]?.length ?? 0})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {CATEGORIES.map((cat) => (
          <TabsContent key={cat.value} value={cat.value}>
            <DataTable
              columns={columns}
              data={itemsByCategory[cat.value] ?? []}
              searchKey="name"
              searchPlaceholder="Buscar por nome..."
            />
          </TabsContent>
        ))}
      </Tabs>
      <TypeProviderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        onSave={handleSave}
      />
    </div>
  );
}
