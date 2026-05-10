"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PerformanceTrace } from "@/app/api/firebase/performance/route";

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

const AXIS_TICK = { fill: "hsl(var(--muted-foreground))", fontSize: 10 };

interface PerformanceChartsProps {
  traces: PerformanceTrace[];
}

export function PerformanceCharts({ traces }: PerformanceChartsProps) {
  // Top 6 slowest by p90
  const chartData = traces.slice(0, 6).map((t) => ({
    name: t.name.replace(/_/g, " "),
    p50: t.p50,
    p90: t.p90,
    p99: t.p99,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Latência por Trace (p50 / p90 / p99)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          6 traces mais lentos — milissegundos
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 8, left: 0, bottom: 40 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--muted-foreground) / 0.15)"
            />
            <XAxis
              dataKey="name"
              tick={{ ...AXIS_TICK, fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}ms`}
              width={55}
            />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(value: number, name: string) => [`${value}ms`, name.toUpperCase()]}
              cursor={{ fill: "hsl(var(--muted-foreground) / 0.08)" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
            />
            <Bar dataKey="p50" fill="#10b981" radius={[3, 3, 0, 0]} name="p50" />
            <Bar dataKey="p90" fill="#f59e0b" radius={[3, 3, 0, 0]} name="p90" />
            <Bar dataKey="p99" fill="#ef4444" radius={[3, 3, 0, 0]} name="p99" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
