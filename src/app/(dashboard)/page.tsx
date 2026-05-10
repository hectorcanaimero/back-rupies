import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/server";
import { DashboardCharts } from "./dashboard-charts";
import {
  Users,
  Briefcase,
  TrendingUp,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// ─── Mock data (fallback when Supabase is not connected) ──────────────────────

const MOCK_KPIS = {
  activeUsers: 1247,
  openServices: 89,
  mrr: 45890.0,
  creditsConsumed: 3420,
};

const MOCK_SERVICES_CHART = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString(
    "pt-BR",
    { day: "2-digit", month: "2-digit" }
  ),
  count: Math.floor(Math.random() * 15) + 2,
}));

const MOCK_CANDIDATURES_CHART = Array.from({ length: 7 }, (_, i) => ({
  date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString("pt-BR", {
    weekday: "short",
  }),
  count: Math.floor(Math.random() * 50) + 10,
}));

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiData {
  activeUsers: number;
  openServices: number;
  mrr: number;
  creditsConsumed: number;
}

interface ChartDataPoint {
  date: string;
  count: number;
}

interface DashboardData {
  kpis: KpiData;
  servicesChart: ChartDataPoint[];
  candidaturesChart: ChartDataPoint[];
}

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const supabase = await createClient();

    // KPI: Usuários Ativos
    const { count: activeUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("status", true)
      .eq("endRegister", true);

    // KPI: Serviços Abertos
    const { count: openServices } = await supabase
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("condition", "Opened");

    // KPI: MRR — active subscriptions joined with plan price_monthly
    const subscriptionsResult = await supabase
      .from("subscriptions")
      .select("plan_id")
      .filter("status", "eq", "active");

    const activeSubscriptions = subscriptionsResult.data as
      | { plan_id: string }[]
      | null;

    let mrr = 0;
    if (activeSubscriptions && activeSubscriptions.length > 0) {
      const planIds = activeSubscriptions.map((s) => s.plan_id);
      const plansResult = await supabase
        .from("subscription_plans")
        .select("id, price_monthly")
        .in("id", planIds);

      const plans = plansResult.data as
        | { id: string; price_monthly: number | null }[]
        | null;

      if (plans) {
        const priceMap = new Map(plans.map((p) => [p.id, p.price_monthly ?? 0]));
        mrr = activeSubscriptions.reduce(
          (sum, s) => sum + (priceMap.get(s.plan_id) ?? 0),
          0
        );
      }
    }

    // KPI: Créditos consumidos no período atual (mês corrente)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const creditBalancesResult = await supabase
      .from("credit_balances")
      .select("credits_used")
      .gte("updated_at", startOfMonth.toISOString());

    const creditBalances = creditBalancesResult.data as
      | { credits_used: number | null }[]
      | null;

    const creditsConsumed =
      creditBalances?.reduce(
        (sum, row) => sum + (row.credits_used ?? 0),
        0
      ) ?? 0;

    // Chart: Serviços criados — últimos 30 dias
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const { data: recentServices } = await supabase
      .from("services")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo);

    const servicesChart = buildDailyChart(recentServices ?? [], 30);

    // Chart: Candidaturas — últimos 7 dias
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    const { data: recentCandidatures } = await supabase
      .from("services_candidated")
      .select("created_at")
      .gte("created_at", sevenDaysAgo);

    const candidaturesChart = buildDailyChart(recentCandidatures ?? [], 7, {
      weekday: "short",
    });

    return {
      kpis: {
        activeUsers: activeUsers ?? 0,
        openServices: openServices ?? 0,
        mrr,
        creditsConsumed,
      },
      servicesChart,
      candidaturesChart,
    };
  } catch {
    // Supabase not connected — use mock data for development
    return {
      kpis: MOCK_KPIS,
      servicesChart: MOCK_SERVICES_CHART,
      candidaturesChart: MOCK_CANDIDATURES_CHART,
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDailyChart(
  rows: { created_at: string | null }[],
  days: number,
  dateFormat: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
  }
): ChartDataPoint[] {
  const counts: Record<string, number> = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const label = d.toLocaleDateString("pt-BR", dateFormat);
    counts[label] = 0;
  }

  for (const row of rows) {
    if (!row.created_at) continue;
    const label = new Date(row.created_at).toLocaleDateString("pt-BR", dateFormat);
    if (label in counts) counts[label]++;
  }

  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: number;
  trend?: "up" | "down" | "neutral";
}

function KpiCardItem({ title, value, icon, change, trend }: KpiCardProps) {
  const showChange = change !== undefined && trend && trend !== "neutral";
  const isUp = trend === "up";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {showChange && (
          <div
            className={`mt-1 flex items-center gap-1 text-xs font-medium ${
              isUp ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {isUp ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            <span>
              {isUp ? "+" : ""}
              {change?.toFixed(1)}% este mês
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { kpis, servicesChart, candidaturesChart } =
    await fetchDashboardData();

  const kpiCards: KpiCardProps[] = [
    {
      title: "Usuários Ativos",
      value: kpis.activeUsers.toLocaleString("pt-BR"),
      icon: <Users className="h-4 w-4" />,
      change: 12.5,
      trend: "up",
    },
    {
      title: "Serviços Abertos",
      value: kpis.openServices.toLocaleString("pt-BR"),
      icon: <Briefcase className="h-4 w-4" />,
      change: -3.2,
      trend: "down",
    },
    {
      title: "MRR",
      value: formatCurrency(kpis.mrr),
      icon: <TrendingUp className="h-4 w-4" />,
      change: 8.1,
      trend: "up",
    },
    {
      title: "Créditos Consumidos",
      value: kpis.creditsConsumed.toLocaleString("pt-BR"),
      icon: <Zap className="h-4 w-4" />,
      trend: "neutral",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral da plataforma Rupies
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCardItem key={card.title} {...card} />
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts
        servicesData={servicesChart}
        candidaturesData={candidaturesChart}
      />
    </div>
  );
}
