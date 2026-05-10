"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { FieldGrid } from "@/components/record-detail";
import { Timeline } from "@/components/record-detail";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import type { CreditBalanceWithUser } from "@/types/app";
import type { CreditConsumptionEntry } from "./page";
import Link from "next/link";
import { Zap, Phone, User } from "lucide-react";

interface CreditTabsProps {
  balance: CreditBalanceWithUser;
  consumption: CreditConsumptionEntry[];
}

function getActionIcon(action: string) {
  if (action.toLowerCase().includes("serviço")) return <Zap className="h-3.5 w-3.5" />;
  if (action.toLowerCase().includes("contratante") || action.toLowerCase().includes("contactado")) return <Phone className="h-3.5 w-3.5" />;
  return <User className="h-3.5 w-3.5" />;
}

export function CreditTabs({ balance, consumption }: CreditTabsProps) {
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const informacoesFields = [
    {
      label: "Usuário",
      value: balance.users ? (
        <Link href={`/usuarios/${balance.users.id}`} className="text-primary hover:underline">
          {balance.users.display_name ?? balance.users.email}
        </Link>
      ) : "—",
    },
    { label: "Email", value: balance.users?.email ?? "—" },
    {
      label: "Assinatura",
      value: balance.subscription_id ? (
        <Link href={`/assinaturas/${balance.subscription_id}`} className="text-primary hover:underline">
          Ver assinatura
        </Link>
      ) : "—",
    },
    { label: "Início do Período", value: formatDate(balance.period_start) },
    { label: "Fim do Período", value: formatDate(balance.period_end) },
    {
      label: "Créditos Concedidos",
      value: balance.is_unlimited ? "Ilimitado" : String(balance.credits_granted),
    },
    {
      label: "Créditos Usados",
      value: balance.is_unlimited ? "—" : (
        <span className="text-orange-400 font-medium">{balance.credits_used ?? 0}</span>
      ),
    },
    {
      label: "Créditos Restantes",
      value: balance.is_unlimited ? "—" : (
        <span className="text-green-400 font-medium">{balance.credits_remaining ?? 0}</span>
      ),
    },
    {
      label: "Ilimitado",
      value: balance.is_unlimited ? <Badge variant="secondary">Sim</Badge> : "Não",
    },
    { label: "Criado em", value: formatDateTime(balance.created_at) },
    { label: "Atualizado em", value: formatDateTime(balance.updated_at) },
  ];

  const totalConsumed = consumption.reduce((s, e) => s + e.credits_consumed, 0);

  const consumptionEvents = consumption.map((entry) => ({
    id: entry.id,
    icon: getActionIcon(entry.action),
    title: entry.action,
    description: entry.reference_id ? `ref: ${entry.reference_id} · -${entry.credits_consumed} crédito${entry.credits_consumed !== 1 ? "s" : ""}` : `-${entry.credits_consumed} crédito${entry.credits_consumed !== 1 ? "s" : ""}`,
    timestamp: entry.timestamp,
  }));

  return (
    <Tabs defaultValue="informacoes">
      <TabsList>
        <TabsTrigger value="informacoes">Informações</TabsTrigger>
        <TabsTrigger value="consumo">Consumo</TabsTrigger>
      </TabsList>

      {/* Tab: Informações */}
      <TabsContent value="informacoes">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Saldo de Créditos</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Ajustar Créditos
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajustar Créditos Manualmente</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="amount"
                      className="text-sm font-medium leading-none"
                    >
                      Quantidade{" "}
                      <span className="text-xs text-muted-foreground font-normal">
                        (positivo para adicionar, negativo para remover)
                      </span>
                    </label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Ex: 10 ou -5"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reason"
                      className="text-sm font-medium leading-none"
                    >
                      Motivo
                    </label>
                    <textarea
                      id="reason"
                      placeholder="Descreva o motivo do ajuste..."
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      // UI only — backend integration in future phase
                      setDialogOpen(false);
                      setAdjustAmount("");
                      setAdjustReason("");
                    }}
                  >
                    Confirmar Ajuste
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <FieldGrid fields={informacoesFields} columns={2} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab: Consumo */}
      <TabsContent value="consumo">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Detalhamento do Consumo</CardTitle>
              <span className="text-sm text-muted-foreground">
                Total: {totalConsumed} crédito{totalConsumed !== 1 ? "s" : ""}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {consumption.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum consumo registrado.</p>
            ) : (
              <Timeline events={consumptionEvents} />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
