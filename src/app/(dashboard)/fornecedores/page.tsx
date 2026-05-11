"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getProviderColumns } from "./columns";
import { ProviderDialog } from "./provider-dialog";
import type { Provider, TypeProvider } from "@/types/app";

export default function FornecedoresPage() {
  const [items, setItems] = useState<Provider[]>([]);
  const [types, setTypes] = useState<TypeProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Provider | null>(null);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const [providersRes, typesRes] = await Promise.all([
      supabase.from("providers").select("*").order("order", { ascending: true }),
      supabase.from("type_provider").select("*").order("name", { ascending: true }),
    ]);
    if (!providersRes.error && providersRes.data) setItems(providersRes.data as Provider[]);
    if (!typesRes.error && typesRes.data) setTypes(typesRes.data as TypeProvider[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const typeNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of types) {
      map[t.id] = t.name ?? "—";
    }
    return map;
  }, [types]);

  const handleEdit = useCallback((item: Provider) => {
    setEditingItem(item);
    setDialogOpen(true);
  }, []);

  const handleToggle = useCallback(async (item: Provider) => {
    const newStatus = !item.status;
    setItems((prev) =>
      prev.map((b) => (b.id === item.id ? { ...b, status: newStatus } : b))
    );
    const supabase = createClient();
    const { error } = await supabase
      .from("providers")
      .update({ status: newStatus } as never)
      .eq("id", item.id);
    if (error) {
      setItems((prev) =>
        prev.map((b) => (b.id === item.id ? { ...b, status: item.status } : b))
      );
    }
  }, []);

  const handleDelete = useCallback(async (item: Provider) => {
    if (!confirm(`Excluir "${item.name}"?`)) return;
    setItems((prev) => prev.filter((b) => b.id !== item.id));
    const supabase = createClient();
    const { error } = await supabase
      .from("providers")
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
        type: string;
        logo: string;
        banner: string;
        wa: string;
        ig: string;
        fb: string;
        web: string;
        phone: string;
        email: string;
        order: number;
        status: boolean;
        select: string;
      },
      id?: string
    ) => {
      const supabase = createClient();
      if (id) {
        const { data: updated, error } = await supabase
          .from("providers")
          .update(data as never)
          .eq("id", id)
          .select()
          .single();
        if (!error && updated) {
          setItems((prev) => prev.map((b) => (b.id === id ? (updated as Provider) : b)));
        }
      } else {
        const { data: created, error } = await supabase
          .from("providers")
          .insert(data as never)
          .select()
          .single();
        if (!error && created) {
          setItems((prev) => [...prev, created as Provider].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        }
      }
    },
    []
  );

  const columns = getProviderColumns({ onEdit: handleEdit, onToggle: handleToggle, onDelete: handleDelete, typeNames });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fornecedores</h1>
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
          Novo Fornecedor
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={items}
        searchKey="name"
        searchPlaceholder="Buscar por nome..."
      />
      <ProviderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        onSave={handleSave}
        types={types}
      />
    </div>
  );
}
