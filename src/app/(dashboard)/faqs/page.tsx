"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getFaqColumns } from "./columns";
import { FaqDialog } from "./faq-dialog";
import type { Sac } from "@/types/app";

const MOCK_FAQS: Sac[] = [
  {
    id: "1",
    title: "Como cancelar minha assinatura?",
    content: "Você pode cancelar sua assinatura a qualquer momento nas configurações do app.",
    order: 1,
    created_at: "2025-01-10T00:00:00Z",
    updated_at: null,
  },
  {
    id: "2",
    title: "Como funciona o sistema de créditos?",
    content: "Créditos são consumidos ao entrar em contato com profissionais ou empresas.",
    order: 2,
    created_at: "2025-01-11T00:00:00Z",
    updated_at: null,
  },
  {
    id: "3",
    title: "O que é um Lead?",
    content: "Um lead é uma solicitação de fornecimento publicada por uma empresa.",
    order: 3,
    created_at: "2025-01-12T00:00:00Z",
    updated_at: null,
  },
];

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<Sac[]>(MOCK_FAQS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Sac | null>(null);

  useState(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("sacs")
          .select("*")
          .order("order", { ascending: true });
        if (!error && data) setFaqs(data);
      } catch {
        // fallback to mock
      }
    })();
  });

  const handleEdit = useCallback((faq: Sac) => {
    setEditingFaq(faq);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (faq: Sac) => {
    if (!confirm(`Excluir FAQ "${faq.title}"?`)) return;
    try {
      const supabase = createClient();
      await supabase.from("sacs").delete().eq("id", faq.id);
    } catch {
      // optimistic
    }
    setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
  }, []);

  const handleSave = useCallback(
    async (data: { title: string; content: string; order: number }, id?: string) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = createClient() as any;
        if (id) {
          const { data: updated, error } = await supabase
            .from("sacs")
            .update(data)
            .eq("id", id)
            .select()
            .single();
          if (!error && updated) {
            setFaqs((prev) => prev.map((f) => (f.id === id ? (updated as Sac) : f)));
            return;
          }
        } else {
          const { data: created, error } = await supabase
            .from("sacs")
            .insert(data)
            .select()
            .single();
          if (!error && created) {
            setFaqs((prev) => [created as Sac, ...prev]);
            return;
          }
        }
      } catch {
        // fallback
      }
      if (id) {
        setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
      } else {
        const temp: Sac = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: null,
          ...data,
        };
        setFaqs((prev) => [temp, ...prev]);
      }
    },
    []
  );

  const columns = getFaqColumns({ onEdit: handleEdit, onDelete: handleDelete });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">FAQs</h1>
          <p className="text-sm text-muted-foreground">{faqs.length} registros</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingFaq(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Novo FAQ
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={faqs}
        searchKey="title"
        searchPlaceholder="Buscar por título..."
      />
      <FaqDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        faq={editingFaq}
        onSave={handleSave}
      />
    </div>
  );
}
