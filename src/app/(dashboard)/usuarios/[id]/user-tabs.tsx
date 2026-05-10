"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGrid } from "@/components/record-detail";
import { Timeline } from "@/components/record-detail";
import {
  SERVICE_CONDITIONS,
  USER_STATUS,
  getUserStatus,
  type ServiceCondition,
} from "@/lib/utils/constants";
import {
  formatCPFCNPJ,
  formatPhone,
  formatDate,
  formatDateTime,
} from "@/lib/utils/format";
import type { User } from "@/types/app";

interface UserService {
  id: string;
  name: string;
  condition: string;
  created_at: string;
}

interface UserSubscription {
  plan_name: string;
  status: string;
  credits_remaining: number;
  credits_granted: number;
  period_start: string;
  period_end: string;
}

interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
}

interface UserTabsProps {
  user: User;
  services: UserService[];
  subscription: UserSubscription | null;
  timeline: TimelineEvent[];
}

export function UserTabs({ user, services, subscription, timeline }: UserTabsProps) {
  const statusKey = getUserStatus(user);
  const statusConfig = USER_STATUS[statusKey];

  const informacoesFields = [
    { label: "Nome", value: user.display_name ?? "—" },
    { label: "Email", value: user.email ?? "—" },
    { label: "Telefone", value: formatPhone(user.phone) },
    { label: "CPF/CNPJ", value: formatCPFCNPJ(user.cpfcnpj) },
    {
      label: "Tipo",
      value: user.isContractor ? "Empresa (Contratante)" : "Profissional",
    },
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
    {
      label: "Cidade/Estado",
      value: user.city && user.state ? `${user.city}, ${user.state}` : "—",
    },
    { label: "Endereço", value: user.address ?? "—" },
    { label: "CEP", value: user.cep ?? "—" },
    { label: "Chave Pix", value: user.chave_pix ?? "—" },
    {
      label: "Rating",
      value: user.rating != null ? `${user.rating.toFixed(1)} ★` : "—",
    },
    { label: "Tipo de Empresa", value: user.type_company ?? "—" },
    { label: "Criado em", value: formatDateTime(user.created_at) },
    { label: "Bio", value: user.bio ?? "—" },
  ];

  return (
    <Tabs defaultValue="informacoes">
      <TabsList>
        <TabsTrigger value="informacoes">Informações</TabsTrigger>
        <TabsTrigger value="servicos">Serviços</TabsTrigger>
        <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>

      {/* Tab: Informações */}
      <TabsContent value="informacoes">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGrid fields={informacoesFields} columns={2} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Serviços */}
      <TabsContent value="servicos">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Serviços ({services.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum serviço encontrado.
              </p>
            ) : (
              <div className="divide-y">
                {services.map((service) => {
                  const conditionKey = service.condition as ServiceCondition;
                  const conditionConfig =
                    SERVICE_CONDITIONS[conditionKey] ?? {
                      label: service.condition,
                      color: "bg-gray-500/20 text-gray-400",
                    };
                  return (
                    <div
                      key={service.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(service.created_at)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${conditionConfig.color}`}
                      >
                        {conditionConfig.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Assinatura */}
      <TabsContent value="assinatura">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            {subscription == null ? (
              <p className="text-sm text-muted-foreground">
                Sem assinatura ativa.
              </p>
            ) : (
              <div className="space-y-6">
                <FieldGrid
                  fields={[
                    { label: "Plano", value: subscription.plan_name },
                    {
                      label: "Status",
                      value: (
                        <Badge
                          variant={
                            subscription.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {subscription.status === "active"
                            ? "Ativo"
                            : subscription.status}
                        </Badge>
                      ),
                    },
                    {
                      label: "Início do Período",
                      value: formatDate(subscription.period_start),
                    },
                    {
                      label: "Fim do Período",
                      value: formatDate(subscription.period_end),
                    },
                  ]}
                  columns={2}
                />

                {/* Credit usage */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Créditos Restantes
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min(
                            100,
                            (subscription.credits_remaining /
                              subscription.credits_granted) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {subscription.credits_remaining}/
                      {subscription.credits_granted} créditos
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Timeline */}
      <TabsContent value="timeline">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividade</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline events={timeline} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
