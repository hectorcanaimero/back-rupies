import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { RevenueCharts } from "./revenue-charts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// ─── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_MRR_CHART = [
  { month: "Jun/25", mrr: 28400 },
  { month: "Jul/25", mrr: 31200 },
  { month: "Ago/25", mrr: 33800 },
  { month: "Set/25", mrr: 35100 },
  { month: "Out/25", mrr: 37600 },
  { month: "Nov/25", mrr: 39200 },
  { month: "Dez/25", mrr: 41500 },
  { month: "Jan/26", mrr: 40100 },
  { month: "Fev/26", mrr: 42800 },
  { month: "Mar/26", mrr: 44300 },
  { month: "Abr/26", mrr: 43900 },
  { month: "Mai/26", mrr: 45890 },
];

const MOCK_SUBSCRIPTIONS_CHART = [
  { month: "Dez/25", novas: 24, canceladas: 5 },
  { month: "Jan/26", novas: 18, canceladas: 8 },
  { month: "Fev/26", novas: 31, canceladas: 6 },
  { month: "Mar/26", novas: 27, canceladas: 9 },
  { month: "Abr/26", novas: 22, canceladas: 11 },
  { month: "Mai/26", novas: 35, canceladas: 7 },
];

const MOCK_PLAN_DISTRIBUTION = [
  { name: "Pro Mensal", value: 58, fill: "#7c3aed" },
  { name: "Starter", value: 27, fill: "#10b981" },
  { name: "Enterprise Anual", value: 11, fill: "#f59e0b" },
  { name: "Gratuito", value: 4, fill: "#6b7280" },
];

const MOCK_KPIS = {
  mrr: 45890.0,
  arr: 550680.0,
  churnRate: 3.2,
  ltv: 1847.5,
  activeSubscriptions: 312,
  newThisMonth: 35,
};

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RevenueKpis {
  mrr: number;
  arr: number;
  churnRate: number;
  ltv: number;
  activeSubscriptions: number;
  newThisMonth: number;
}

export interface MrrDataPoint {
  month: string;
  mrr: number;
}

export interface SubscriptionsChartPoint {
  month: string;
  novas: number;
  canceladas: number;
}

export interface PlanDistributionPoint {
  name: string;
  value: number;
  fill: string;
}

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function fetchRevenueData(): Promise<{
  kpis: RevenueKpis;
  mrrChart: MrrDataPoint[];
  subscriptionsChart: SubscriptionsChartPoint[];
  planDistribution: PlanDistributionPoint[];
}> {
  try {
    const supabase = await createClient();

    // Active subscriptions count
    const { count: activeCount } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // New subscriptions this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newCount } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());

    // MRR from active subscriptions
    const activeSubsResult = await supabase
      .from("subscriptions")
      .select("plan_id, billing_cycle")
      .eq("status", "active");

    const activeSubs = activeSubsResult.data as
      | { plan_id: string; billing_cycle: string | null }[]
      | null;

    let mrr = 0;
    if (activeSubs && activeSubs.length > 0) {
      const planIds = activeSubs.map((s) => s.plan_id);
      const plansResult = await supabase
        .from("subscription_plans")
        .select("id, price_monthly, price_yearly")
        .in("id", planIds);

      const plans = plansResult.data as
        | { id: string; price_monthly: number | null; price_yearly: number | null }[]
        | null;

      if (plans) {
        const priceMap = new Map(
          plans.map((p) => [
            p.id,
            { monthly: p.price_monthly ?? 0, yearly: p.price_yearly ?? 0 },
          ])
        );
        mrr = activeSubs.reduce((sum, s) => {
          const prices = priceMap.get(s.plan_id);
          if (!prices) return sum;
          // Yearly billing → monthly contribution = yearly / 12
          const contribution =
            s.billing_cycle === "yearly"
              ? prices.yearly / 12
              : prices.monthly;
          return sum + contribution;
        }, 0);
      }
    }

    return {
      kpis: {
        mrr,
        arr: mrr * 12,
        churnRate: MOCK_KPIS.churnRate,
        ltv: MOCK_KPIS.ltv,
        activeSubscriptions: activeCount ?? 0,
        newThisMonth: newCount ?? 0,
      },
      mrrChart: MOCK_MRR_CHART,
      subscriptionsChart: MOCK_SUBSCRIPTIONS_CHART,
      planDistribution: MOCK_PLAN_DISTRIBUTION,
    };
  } catch {
    return {
      kpis: MOCK_KPIS,
      mrrChart: MOCK_MRR_CHART,
      subscriptionsChart: MOCK_SUBSCRIPTIONS_CHART,
      planDistribution: MOCK_PLAN_DISTRIBUTION,
    };
  }
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

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

export default async function RevenuePage() {
  const { kpis, mrrChart, subscriptionsChart, planDistribution } =
    await fetchRevenueData();

  const kpiCards: KpiCardProps[] = [
    {
      title: "MRR",
      value: formatCurrency(kpis.mrr),
      icon: <DollarSign className="h-4 w-4" />,
      change: 4.5,
      trend: "up",
    },
    {
      title: "ARR",
      value: formatCurrency(kpis.arr),
      icon: <TrendingUp className="h-4 w-4" />,
      change: 4.5,
      trend: "up",
    },
    {
      title: "Churn Rate",
      value: `${kpis.churnRate.toFixed(1)}%`,
      icon: <TrendingDown className="h-4 w-4" />,
      change: -0.3,
      trend: "up",
    },
    {
      title: "LTV Médio",
      value: formatCurrency(kpis.ltv),
      icon: <Users className="h-4 w-4" />,
      change: 2.1,
      trend: "up",
    },
    {
      title: "Assinaturas Ativas",
      value: kpis.activeSubscriptions.toLocaleString("pt-BR"),
      icon: <Users className="h-4 w-4" />,
      change: 5.8,
      trend: "up",
    },
    {
      title: "Novas Este Mês",
      value: kpis.newThisMonth.toLocaleString("pt-BR"),
      icon: <ArrowUpRight className="h-4 w-4" />,
      trend: "neutral",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Revenue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Métricas financeiras e análise de receita
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((card) => (
          <KpiCardItem key={card.title} {...card} />
        ))}
      </div>

      {/* Charts */}
      <RevenueCharts
        mrrData={mrrChart}
        subscriptionsData={subscriptionsChart}
        planDistributionData={planDistribution}
      />
    </div>
  );
}
