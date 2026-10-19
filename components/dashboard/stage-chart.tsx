"use client";

import type { Stage } from "@prisma/client";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { STAGE_CHART_COLORS, STAGE_LABELS } from "@/lib/stages";
import { ChartCard, chartClass } from "./chart-card";

const config = { count: { label: "Candidates" } } satisfies ChartConfig;

export function StageChart({ data }: { data: { stage: Stage; count: number }[] }) {
  const rows = data.map((d) => ({ ...d, label: STAGE_LABELS[d.stage] }));
  return (
    <ChartCard
      title="Candidates by stage"
      description="Where every candidate is right now"
      empty={data.every((d) => d.count === 0)}
    >
      <ChartContainer config={config} className={chartClass}>
        <BarChart data={rows}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={48}
            fontSize={11}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={4}>
            {rows.map((r) => (
              <Cell key={r.stage} fill={STAGE_CHART_COLORS[r.stage]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
