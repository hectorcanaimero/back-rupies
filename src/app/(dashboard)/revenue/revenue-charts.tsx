"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MrrDataPoint, SubscriptionsChartPoint, PlanDistributionPoint } from "./page";

interface RevenueChartsProps {
  mrrData: MrrDataPoint[];
  subscriptionsData: SubscriptionsChartPoint[];
  planDistributionData: PlanDistributionPoint[];
}

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--card-foreground))",
    fontSize: 12,
  },
  labelStyle: { color: "hsl(var(--muted-foreground))" },
};

const AXIS_TICK = { fill: "hsl(var(--muted-foreground))", fontSize: 11 };

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function RevenueCharts({
  mrrData,
  subscriptionsData,
  planDistributionData,
}: RevenueChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Line Chart — Receita mensal (MRR) */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Receita Mensal (MRR)</CardTitle>
          <p className="text-sm text-muted-foreground">Últimos 12 meses</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={mrrData}
              margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--muted-foreground) / 0.15)"
              />
              <XAxis
                dataKey="month"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatBRL(v)}
                width={90}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value: number) => [formatBRL(value), "MRR"]}
                cursor={{ stroke: "hsl(var(--muted-foreground) / 0.3)" }}
              />
              <Line
                type="monotone"
                dataKey="mrr"
                stroke="#7c3aed"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#7c3aed" }}
                name="MRR"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar Chart — Assinaturas novas vs canceladas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Assinaturas Novas vs. Canceladas
          </CardTitle>
          <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={subscriptionsData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--muted-foreground) / 0.15)"
              />
              <XAxis
                dataKey="month"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                cursor={{ fill: "hsl(var(--muted-foreground) / 0.08)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
              />
              <Bar
                dataKey="novas"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="Novas"
              />
              <Bar
                dataKey="canceladas"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                name="Canceladas"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart — Distribuição por plano */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Distribuição por Plano
          </CardTitle>
          <p className="text-sm text-muted-foreground">Assinaturas ativas</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={planDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {planDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
