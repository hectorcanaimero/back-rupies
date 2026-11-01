import { createAdminClient } from "@/lib/supabase/admin";
import { DetailPanel } from "@/components/record-detail";
import { Button } from "@/components/ui/button";
import { LeadTabs } from "./lead-tabs";
import { notFound } from "next/navigation";
import type { Lead } from "@/types/app";
import type { LeadContactWithUser } from "./lead-tabs";

async function getLead(id: string): Promise<Lead | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("rp_leads").select("*").eq("id", id).maybeSingle();
  return data;
}

async function getLeadEmpresa(userId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_users")
    .select("id, name, email")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

async function getLeadContacts(leadId: string): Promise<LeadContactWithUser[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("rp_lead_contact")
    .select("*, users:rp_users(id, name, email)")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lead = await getLead(id);
  if (!lead) notFound();
  const [empresa, contacts] = await Promise.all([
    getLeadEmpresa(lead.user_id),
    getLeadContacts(id),
  ]);

  return (
    <DetailPanel
      title={lead.title || "Lead"}
      subtitle={lead.type_fornecedor ?? undefined}
      backHref="/leads"
      actions={
        lead.status !== "open" ? null : (
          <Button variant="outline" size="sm">
            Finalizar Lead
          </Button>
        )
      }
    >
      <LeadTabs
        lead={lead}
        contacts={contacts}
        empresa={empresa}
      />
    </DetailPanel>
  );
}
