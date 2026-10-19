"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { ChartCard, chartClass } from "./chart-card";

const config = { count: { label: "Applications", color: "var(--chart-1)" } } satisfies ChartConfig;

export function ApplicationsChart({ data }: { data: { week: string; count: number }[] }) {
  return (
    <ChartCard
      title="Applications per week (last 12 weeks)"
      description="New candidates in each 7-day window"
      empty={data.every((d) => d.count === 0)}
    >
      <ChartContainer config={config} className={chartClass}>
        <AreaChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="week" tickLine={false} axisLine={false} minTickGap={16} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(w) => `Week of ${w}`} />} />
          <Area
            dataKey="count"
            type="monotone"
            stroke="var(--color-count)"
            fill="var(--color-count)"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}
