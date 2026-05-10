import { createClient } from "@/lib/supabase/server";
import { DetailPanel } from "@/components/record-detail";
import { Button } from "@/components/ui/button";
import { LeadTabs } from "./lead-tabs";
import type { Lead, LeadContact, LeadAttachment } from "@/types/app";

const MOCK_LEAD: Lead = {
  id: "1",
  userId: "1",
  name: "Fornecedor de EPI",
  description: "Preciso de 500 unidades de capacetes de segurança homologados.",
  type_supplier: "Equipamentos",
  budget: 15000,
  quantity: 500,
  return_deadline: "15 dias",
  finished: false,
  created_at: "2025-05-01T10:00:00Z",
  updated_at: null,
};

const MOCK_CONTACTS: LeadContact[] = [
  {
    id: "1",
    leadId: "1",
    userId: "2",
    name: "Maria Santos",
    phone: "21988887777",
    email: "maria@gmail.com",
    created_at: "2025-05-02T10:00:00Z",
  },
  {
    id: "2",
    leadId: "1",
    userId: null,
    name: "Fornecedora ABC",
    phone: "11977773333",
    email: "contato@abc.com",
    created_at: "2025-05-03T14:00:00Z",
  },
];

const MOCK_ATTACHMENTS: LeadAttachment[] = [
  {
    id: "1",
    leadId: "1",
    url: "https://example.com/edital.pdf",
    name: "Edital de Cotação",
    type: "application/pdf",
    created_at: "2025-05-01T10:00:00Z",
  },
];

const MOCK_EMPRESA = {
  id: "1",
  display_name: "João Silva",
  email: "joao@empresa.com",
};

async function getLead(id: string): Promise<Lead> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data ?? MOCK_LEAD;
  } catch {
    return MOCK_LEAD;
  }
}

async function getLeadEmpresa(userId: string | null) {
  if (!userId) return MOCK_EMPRESA;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("users")
      .select("id, display_name, email")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data ?? MOCK_EMPRESA;
  } catch {
    return MOCK_EMPRESA;
  }
}

async function getLeadContacts(leadId: string): Promise<LeadContact[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lead_contact")
      .select("*")
      .eq("leadId", leadId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? MOCK_CONTACTS;
  } catch {
    return MOCK_CONTACTS;
  }
}

async function getLeadAttachments(leadId: string): Promise<LeadAttachment[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lead_attachment")
      .select("*")
      .eq("leadId", leadId);
    if (error) throw error;
    return data ?? MOCK_ATTACHMENTS;
  } catch {
    return MOCK_ATTACHMENTS;
  }
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lead = await getLead(id);
  const [empresa, contacts, attachments] = await Promise.all([
    getLeadEmpresa(lead.userId),
    getLeadContacts(id),
    getLeadAttachments(id),
  ]);

  return (
    <DetailPanel
      title={lead.name ?? "Lead"}
      subtitle={lead.type_supplier ?? undefined}
      backHref="/leads"
      actions={
        lead.finished ? null : (
          <Button variant="outline" size="sm">
            Finalizar Lead
          </Button>
        )
      }
    >
      <LeadTabs
        lead={lead}
        contacts={contacts}
        attachments={attachments}
        empresa={empresa}
      />
    </DetailPanel>
  );
}
