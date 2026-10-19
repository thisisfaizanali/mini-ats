"use client";

import type { Stage } from "@prisma/client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { STAGE_CHART_COLORS, STAGE_LABELS, STAGES } from "@/lib/stages";
import { ChartCard, chartClass } from "./chart-card";

const config: ChartConfig = Object.fromEntries(
  STAGES.map((s) => [s, { label: STAGE_LABELS[s], color: STAGE_CHART_COLORS[s] }]),
);

export function PipelineChart({ data }: { data: ({ job: string } & Record<Stage, number>)[] }) {
  return (
    <ChartCard
      title="Pipeline by job"
      description="Candidates per job, split by stage (includes closed jobs)"
      empty={data.every((d) => STAGES.every((s) => d[s] === 0))}
      className="lg:col-span-2"
    >
      <ChartContainer config={config} className={chartClass}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid horizontal={false} />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="job" tickLine={false} axisLine={false} width={120} fontSize={11} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend
            content={<ChartLegendContent />}
            itemSorter={(item) => STAGES.indexOf(item.dataKey as Stage)}
          />
          {STAGES.map((s) => (
            <Bar key={s} dataKey={s} stackId="a" fill={`var(--color-${s})`} />
          ))}
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
