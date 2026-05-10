// src/app/(dashboard)/crashlytics/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bug, Users } from "lucide-react";
import { CrashlyticsCharts } from "./crashlytics-charts";
import type { CrashlyticsResponse } from "@/app/api/firebase/crashlytics/route";

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function fetchCrashlytics(
  app?: string,
  version?: string
): Promise<CrashlyticsResponse> {
  try {
    const params = new URLSearchParams();
    if (app) params.set("app", app);
    if (version) params.set("version", version);

    // Self-call to Route Handler (absolute URL needed in RSC)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      `http://localhost:${process.env.PORT ?? 3000}`;

    const res = await fetch(
      `${baseUrl}/api/firebase/crashlytics?${params.toString()}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("API error");
    return res.json();
  } catch {
    // Inline mock fallback if fetch fails (e.g., cold start)
    return {
      issues: [],
      trend: [],
      totalCrashes: 0,
      affectedUsers: 0,
      isMock: true,
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CrashlyticsPage() {
  const data = await fetchCrashlytics();

  const kpis = [
    {
      title: "Total de Crashes",
      value: data.totalCrashes.toLocaleString("pt-BR"),
      icon: <Bug className="h-4 w-4" />,
      color: "text-red-500",
    },
    {
      title: "Usuários Afetados",
      value: data.affectedUsers.toLocaleString("pt-BR"),
      icon: <Users className="h-4 w-4" />,
      color: "text-amber-500",
    },
    {
      title: "Issues Abertas",
      value: data.issues.length.toLocaleString("pt-BR"),
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Crashlytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Relatórios de falhas do app
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
                <div className={`${kpi.color}`}>{kpi.icon}</div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend chart */}
      <CrashlyticsCharts trend={data.trend} />

      {/* Issues table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Top Issues ({data.issues.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Issue
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground whitespace-nowrap">
                    Crashes
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground whitespace-nowrap">
                    Usuários
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    App
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Versão
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    Último
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.issues.map((issue, idx) => (
                  <tr
                    key={issue.id}
                    className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${
                      idx === 0 ? "bg-red-500/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3 max-w-sm">
                      <p className="font-medium leading-tight truncate">
                        {issue.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        {issue.subtitle}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-500">
                      {issue.count.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {issue.affectedUsers}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          issue.app === "empresas"
                            ? "text-blue-500 border-blue-500/30"
                            : "text-emerald-500 border-emerald-500/30"
                        }
                      >
                        {issue.app === "empresas" ? "Empresas" : "Profissionais"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {issue.appVersion}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(issue.lastSeen)}
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
