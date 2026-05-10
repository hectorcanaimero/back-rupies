"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FieldGrid } from "@/components/record-detail";
import { Timeline } from "@/components/record-detail";
import {
  SUBSCRIPTION_STATUS,
  BILLING_CYCLES,
  type SubscriptionStatus,
  type BillingCycle,
} from "@/lib/utils/constants";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils/format";
import type { SubscriptionWithRelations, SubscriptionUsage, CreditBalance } from "@/types/app";
import Link from "next/link";

interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  timestamp: string;
}

interface SubscriptionTabsProps {
  subscription: SubscriptionWithRelations;
  usage: SubscriptionUsage | null;
  credits: CreditBalance | null;
  timeline: TimelineEvent[];
}

export function SubscriptionTabs({
  subscription,
  usage,
  credits,
  timeline,
}: SubscriptionTabsProps) {
  const statusKey = subscription.status as SubscriptionStatus;
  const statusConfig = SUBSCRIPTION_STATUS[statusKey] ?? {
    label: subscription.status,
    color: "bg-gray-500/20 text-gray-400",
  };

  const cycleKey = subscription.billing_cycle as BillingCycle;
  const cycleLabel = BILLING_CYCLES[cycleKey]?.label ?? subscription.billing_cycle ?? "—";

  const plan = subscription.subscription_plans;
  const user = subscription.users;

  const informacoesFields = [
    {
      label: "Usuário",
      value: user ? (
        <Link href={`/usuarios/${user.id}`} className="text-primary hover:underline">
          {user.display_name ?? user.email}
        </Link>
      ) : "—",
    },
    { label: "Email", value: user?.email ?? "—" },
    { label: "Plano", value: plan?.name ?? "—" },
    {
      label: "Status",
      value: (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}
        >
          {statusConfig.label}
        </span>
      ),
    },
    { label: "Ciclo de Cobrança", value: cycleLabel },
    {
      label: "Preço",
      value: subscription.billing_cycle === "yearly"
        ? formatCurrency(plan?.price_yearly)
        : formatCurrency(plan?.price_monthly),
    },
    { label: "Início do Período", value: formatDate(subscription.current_period_start) },
    { label: "Fim do Período", value: formatDate(subscription.current_period_end) },
    {
      label: "Cancelar no Fim do Período",
      value: subscription.cancel_at_period_end ? "Sim" : "Não",
    },
    { label: "Cancelado em", value: formatDateTime(subscription.canceled_at) },
    { label: "Trial Início", value: formatDate(subscription.trial_start) },
    { label: "Trial Fim", value: formatDate(subscription.trial_end) },
    {
      label: "Asaas Subscription ID",
      value: (
        <span className="font-mono text-xs">{subscription.asaas_subscription_id ?? "—"}</span>
      ),
    },
    {
      label: "Asaas Customer ID",
      value: (
        <span className="font-mono text-xs">{subscription.asaas_customer_id ?? "—"}</span>
      ),
    },
    { label: "Criado em", value: formatDateTime(subscription.created_at) },
    { label: "Atualizado em", value: formatDateTime(subscription.updated_at) },
  ];

  return (
    <Tabs defaultValue="informacoes">
      <TabsList>
        <TabsTrigger value="informacoes">Informações</TabsTrigger>
        <TabsTrigger value="uso">Uso</TabsTrigger>
        <TabsTrigger value="creditos">Créditos</TabsTrigger>
        <TabsTrigger value="historico">Histórico</TabsTrigger>
      </TabsList>

      {/* Tab: Informações */}
      <TabsContent value="informacoes">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados da Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGrid fields={informacoesFields} columns={2} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Uso */}
      <TabsContent value="uso">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uso do Período Atual</CardTitle>
          </CardHeader>
          <CardContent>
            {usage == null ? (
              <p className="text-sm text-muted-foreground">Sem dados de uso para este período.</p>
            ) : (
              <div className="space-y-6">
                <p className="text-xs text-muted-foreground">
                  {formatDate(usage.period_start)} → {formatDate(usage.period_end)}
                </p>
                <UsageMetric
                  label="Serviços Criados"
                  value={usage.services_created ?? 0}
                  max={20}
                />
                <UsageMetric
                  label="Contratantes Contactados"
                  value={usage.contractors_contacted ?? 0}
                  max={50}
                />
                <UsageMetric
                  label="Candidaturas Recebidas"
                  value={usage.candidates_received ?? 0}
                  max={100}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Créditos */}
      <TabsContent value="creditos">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Créditos do Período</CardTitle>
          </CardHeader>
          <CardContent>
            {credits == null ? (
              <p className="text-sm text-muted-foreground">Sem saldo de créditos para este período.</p>
            ) : credits.is_unlimited ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {formatDate(credits.period_start)} → {formatDate(credits.period_end)}
                </p>
                <Badge variant="secondary">Uso Ilimitado</Badge>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-xs text-muted-foreground">
                  {formatDate(credits.period_start)} → {formatDate(credits.period_end)}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <CreditStat label="Concedidos" value={credits.credits_granted} color="text-foreground" />
                  <CreditStat label="Usados" value={credits.credits_used ?? 0} color="text-orange-400" />
                  <CreditStat label="Restantes" value={credits.credits_remaining ?? 0} color="text-green-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Uso de Créditos
                  </p>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          ((credits.credits_used ?? 0) / credits.credits_granted) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {credits.credits_used ?? 0} de {credits.credits_granted} créditos usados
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Histórico */}
      <TabsContent value="historico">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline
              events={timeline.map((ev) => ({
                id: ev.id,
                title: ev.title,
                description: ev.description ?? undefined,
                timestamp: ev.timestamp,
              }))}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// ─── Internal sub-components ───────────────────────────────────────────────────

function UsageMetric({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CreditStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border p-4 text-center space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
