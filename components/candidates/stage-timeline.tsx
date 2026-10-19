import type { StageChange } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatRelative } from "@/lib/format";
import { STAGE_BADGE_CLASSES, STAGE_LABELS } from "@/lib/stages";

export function StageTimeline({ history }: { history: StageChange[] }) {
  if (history.length === 0) {
    return <p className="text-muted-foreground text-sm">No stage changes yet</p>;
  }

  return (
    <ol className="border-border ml-1.5 space-y-5 border-l">
      {history.map((h) => (
        <li key={h.id} className="relative pl-5">
          <span className="bg-primary ring-background absolute top-1.5 -left-[5px] size-2.5 rounded-full ring-4" />
          {h.fromStage === null ? (
            <Badge className={STAGE_BADGE_CLASSES[h.toStage]}>Applied</Badge>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={STAGE_BADGE_CLASSES[h.fromStage]}>
                {STAGE_LABELS[h.fromStage]}
              </Badge>
              <span aria-label="to">→</span>
              <Badge className={STAGE_BADGE_CLASSES[h.toStage]}>{STAGE_LABELS[h.toStage]}</Badge>
            </div>
          )}
          <p className="text-muted-foreground mt-1 text-xs">
            {formatDateTime(h.changedAt)} · {formatRelative(h.changedAt)}
          </p>
        </li>
      ))}
    </ol>
  );
}
