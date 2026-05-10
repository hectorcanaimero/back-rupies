// src/app/(dashboard)/performance/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, Wifi, CheckCircle2 } from "lucide-react";
import { PerformanceCharts } from "./performance-charts";
import type { PerformanceResponse } from "@/app/api/firebase/performance/route";

async function fetchPerformance(): Promise<PerformanceResponse> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      `http://localhost:${process.env.PORT ?? 3000}`;
    const res = await fetch(`${baseUrl}/api/firebase/performance`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("API error");
    return res.json();
  } catch {
    return {
      traces: [],
      networkRequests: [],
      avgResponseTime: 0,
      p99Latency: 0,
      successRate: 0,
      isMock: true,
    };
  }
}

function latencyColor(ms: number): string {
  if (ms < 500) return "text-emerald-500";
  if (ms < 1500) return "text-amber-500";
  return "text-red-500";
}

export default async function PerformancePage() {
  const data = await fetchPerformance();

  const kpis = [
    {
      title: "Tempo Médio de Resposta",
      value: `${data.avgResponseTime}ms`,
      icon: <Timer className="h-4 w-4" />,
    },
    {
      title: "Pior Latência (p99)",
      value: `${data.p99Latency}ms`,
      icon: <Timer className="h-4 w-4" />,
    },
    {
      title: "Taxa de Sucesso",
      value: `${data.successRate}%`,
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitoramento de performance do app
          </p>
        </div>
        {data.isMock && (
          <Badge variant="outline" className="text-amber-500 border-amber-500/30">
            Dados simulados
          </Badge>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              <p className="text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Traces chart */}
      <PerformanceCharts traces={data.traces} />

      {/* Traces table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Timer className="h-4 w-4" />
            Traces ({data.traces.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">p50</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">p90</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">p99</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amostras</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">App</th>
                </tr>
              </thead>
              <tbody>
                {data.traces.map((trace, idx) => (
                  <tr
                    key={`${trace.name}-${idx}`}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{trace.name}</td>
                    <td className={`px-4 py-3 text-right text-xs font-semibold ${latencyColor(trace.p50)}`}>
                      {trace.p50}ms
                    </td>
                    <td className={`px-4 py-3 text-right text-xs font-semibold ${latencyColor(trace.p90)}`}>
                      {trace.p90}ms
                    </td>
                    <td className={`px-4 py-3 text-right text-xs font-semibold ${latencyColor(trace.p99)}`}>
                      {trace.p99}ms
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {trace.sampleCount.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          trace.app === "empresas"
                            ? "text-blue-500 border-blue-500/30"
                            : "text-emerald-500 border-emerald-500/30"
                        }
                      >
                        {trace.app === "empresas" ? "Empresas" : "Profissionais"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Network requests table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Wifi className="h-4 w-4" />
            Requisições de Rede ({data.networkRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">URL</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Latência Média</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Taxa de Sucesso</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amostras</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">App</th>
                </tr>
              </thead>
              <tbody>
                {data.networkRequests.map((req, idx) => (
                  <tr
                    key={`${req.url}-${idx}`}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs max-w-sm truncate">
                      {req.url}
                    </td>
                    <td className={`px-4 py-3 text-right text-xs font-semibold ${latencyColor(req.avgLatency)}`}>
                      {req.avgLatency}ms
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-xs font-semibold ${
                          req.successRate >= 99
                            ? "text-emerald-500"
                            : req.successRate >= 97
                            ? "text-amber-500"
                            : "text-red-500"
                        }`}
                      >
                        {req.successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                      {req.sampleCount.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          req.app === "empresas"
                            ? "text-blue-500 border-blue-500/30"
                            : "text-emerald-500 border-emerald-500/30"
                        }
                      >
                        {req.app === "empresas" ? "Empresas" : "Profissionais"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
