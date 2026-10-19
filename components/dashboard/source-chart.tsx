"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { ChartCard, chartClass } from "./chart-card";

const config = { count: { label: "Candidates", color: "var(--chart-2)" } } satisfies ChartConfig;

export function SourceChart({ data }: { data: { source: string; count: number }[] }) {
  return (
    <ChartCard
      title="Candidates by source"
      description="Where applicants found us"
      empty={data.every((d) => d.count === 0)}
    >
      <ChartContainer config={config} className={chartClass}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid horizontal={false} />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="source" tickLine={false} axisLine={false} width={96} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
