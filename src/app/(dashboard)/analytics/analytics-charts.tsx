"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyActiveUser, TopEvent } from "@/app/api/firebase/analytics/route";

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

// Gradient of purples for the top events bar chart
const EVENT_COLORS = [
  "#7c3aed", "#8b5cf6", "#9d74f8", "#a78bfa",
  "#b39dfa", "#bfacfb", "#c5b5fc", "#ccc0fd",
  "#d4ccfd", "#ddd8fe",
];

interface AnalyticsChartsProps {
  trend: DailyActiveUser[];
  topEvents: TopEvent[];
  period: number;
}

export function AnalyticsCharts({ trend, topEvents, period }: AnalyticsChartsProps) {
  // Show fewer x-axis ticks for 90-day view to avoid crowding
  const tickInterval = period === 90 ? 6 : period === 30 ? 3 : 1;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Active users trend */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Usuários Ativos por Dia
          </CardTitle>
          <p className="text-sm text-muted-foreground">Últimos {period} dias</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={trend}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--muted-foreground) / 0.15)"
              />
              <XAxis
                dataKey="date"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                interval={tickInterval}
              />
              <YAxis
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value: number) => [value.toLocaleString("pt-BR"), "Usuários"]}
                cursor={{ stroke: "hsl(var(--muted-foreground) / 0.3)" }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#7c3aed"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "#7c3aed" }}
                name="Usuários"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top 10 events — horizontal bar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Top 10 Eventos
          </CardTitle>
          <p className="text-sm text-muted-foreground">Por volume de disparos</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topEvents}
              layout="vertical"
              margin={{ top: 4, right: 32, left: 140, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--muted-foreground) / 0.15)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.toLocaleString("pt-BR")}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ ...AXIS_TICK, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={135}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value: number) => [value.toLocaleString("pt-BR"), "Eventos"]}
                cursor={{ fill: "hsl(var(--muted-foreground) / 0.08)" }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Eventos">
                {topEvents.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={EVENT_COLORS[index] ?? "#7c3aed"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
