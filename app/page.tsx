import { Activity, Briefcase, Clock, UserCheck, Users, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getKpis } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [kpis] = await Promise.all([getKpis()]);

  const cards: { label: string; value: string | number; hint: string; icon: LucideIcon }[] = [
    { label: "Total candidates", value: kpis.total, hint: "All time", icon: Users },
    { label: "Active in pipeline", value: kpis.active, hint: "Not hired or rejected", icon: Activity },
    { label: "Hired, last 30 days", value: kpis.hiredLast30, hint: "Currently in Hired", icon: UserCheck },
    { label: "Open jobs", value: kpis.openJobs, hint: "Accepting candidates", icon: Briefcase },
    {
      label: "Avg. days to hire",
      value: kpis.avgDaysToHire ?? "—",
      hint: "Applied to hired",
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Hiring pipeline at a glance</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map(({ label, value, hint, icon: Icon }) => (
          <Card key={label} className="py-4">
            <CardContent className="px-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-muted-foreground text-sm font-medium">{label}</p>
                <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
              <p className="text-muted-foreground mt-1 truncate text-xs">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
