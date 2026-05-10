// src/app/(dashboard)/analytics/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Clock, Activity } from "lucide-react";
import { AnalyticsCharts } from "./analytics-charts";
import type { AnalyticsResponse } from "@/app/api/firebase/analytics/route";

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function fetchAnalytics(period = 30): Promise<AnalyticsResponse> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      `http://localhost:${process.env.PORT ?? 3000}`;
    const res = await fetch(
      `${baseUrl}/api/firebase/analytics?period=${period}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("API error");
    return res.json();
  } catch {
    return {
      dau: 0,
      mau: 0,
      dauMauRatio: 0,
      avgSessionDurationSec: 0,
      trend: [],
      topEvents: [],
      isMock: true,
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const period = 30; // default — make dynamic with searchParams when needed
  const data = await fetchAnalytics(period);

  const kpis = [
    {
      title: "DAU",
      value: data.dau.toLocaleString("pt-BR"),
      sub: "Usuários ativos hoje",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "MAU",
      value: data.mau.toLocaleString("pt-BR"),
      sub: "Usuários ativos em 30 dias",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      title: "DAU/MAU",
      value: `${data.dauMauRatio.toFixed(1)}%`,
      sub: "Índice de engajamento",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      title: "Sessão Média",
      value: formatDuration(data.avgSessionDurationSec),
      sub: "Duração por sessão",
      icon: <Clock className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Google Analytics 4 — dados de uso do app
          </p>
        </div>
        {data.isMock && (
          <Badge variant="outline" className="text-amber-500 border-amber-500/30">
            Dados simulados
          </Badge>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className="text-muted-foreground">{kpi.icon}</div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold leading-tight">{kpi.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <AnalyticsCharts
        trend={data.trend}
        topEvents={data.topEvents}
        period={period}
      />
    </div>
  );
}
