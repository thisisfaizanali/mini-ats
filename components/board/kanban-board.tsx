"use client";

import type { Stage } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { STAGE_BADGE_CLASSES, STAGE_LABELS, STAGES } from "@/lib/stages";
import { cn } from "@/lib/utils";
import { CandidateCard } from "./candidate-card";

export type BoardCandidate = {
  id: string;
  name: string;
  stage: Stage;
  appliedAt: Date;
  job: { title: string };
};

export function KanbanBoard({ candidates }: { candidates: BoardCandidate[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const items = candidates.filter((c) => c.stage === stage);
        return (
          <section key={stage} className="bg-muted/50 flex w-72 shrink-0 flex-col rounded-lg border p-3">
            <header className="mb-3 flex items-center gap-2">
              <span className={cn("size-2.5 rounded-full ring-1 ring-current", STAGE_BADGE_CLASSES[stage])} />
              <h2 className="text-sm font-medium">{STAGE_LABELS[stage]}</h2>
              <Badge variant="secondary" className="ml-auto">
                {items.length}
              </Badge>
            </header>
            <div className="flex min-h-24 flex-1 flex-col gap-2">
              {items.length === 0 ? (
                <p className="text-muted-foreground flex flex-1 items-center justify-center rounded-md border border-dashed text-sm">
                  No candidates
                </p>
              ) : (
                items.map((c) => <CandidateCard key={c.id} candidate={c} />)
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
