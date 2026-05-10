"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CrashlyticsDay } from "@/app/api/firebase/crashlytics/route";

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

interface CrashlyticsChartsProps {
  trend: CrashlyticsDay[];
}

export function CrashlyticsCharts({ trend }: CrashlyticsChartsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Crashes por Dia
        </CardTitle>
        <p className="text-sm text-muted-foreground">Últimos 14 dias</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
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
              interval={1}
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(value: number) => [value, "Crashes"]}
              cursor={{ stroke: "hsl(var(--muted-foreground) / 0.3)" }}
            />
            <Line
              type="monotone"
              dataKey="crashes"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#ef4444" }}
              name="Crashes"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
