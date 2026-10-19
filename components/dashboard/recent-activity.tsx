import type { Stage } from "@prisma/client";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelative } from "@/lib/format";
import { STAGE_BADGE_CLASSES, STAGE_LABELS } from "@/lib/stages";
import { EmptyState } from "./chart-card";

type Item = {
  id: string;
  fromStage: Stage | null;
  toStage: Stage;
  changedAt: Date;
  candidate: { id: string; name: string; job: { title: string } };
};

export function RecentActivity({ items }: { items: Item[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Latest applications and stage changes</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState>No activity yet</EmptyState>
        ) : (
          <ul className="space-y-3">
            {items.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <Link href={`/candidates/${a.candidate.id}`} className="font-medium hover:underline">
                  {a.candidate.name}
                </Link>
                {a.fromStage === null ? (
                  <span className="text-muted-foreground">
                    applied for <span className="text-foreground">{a.candidate.job.title}</span>
                  </span>
                ) : (
                  <>
                    <span className="text-muted-foreground">moved</span>
                    <Badge className={STAGE_BADGE_CLASSES[a.fromStage]}>{STAGE_LABELS[a.fromStage]}</Badge>
                    <span aria-label="to">→</span>
                    <Badge className={STAGE_BADGE_CLASSES[a.toStage]}>{STAGE_LABELS[a.toStage]}</Badge>
                  </>
                )}
                <span className="text-muted-foreground ml-auto text-xs">{formatRelative(a.changedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
