"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { Stage } from "@prisma/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { updateCandidateStage } from "@/app/actions/candidates";
import { Badge } from "@/components/ui/badge";
import { STAGE_BADGE_CLASSES, STAGE_LABELS, STAGES } from "@/lib/stages";
import { cn } from "@/lib/utils";
import { CandidateCard, CandidateCardOverlay } from "./candidate-card";

export type BoardCandidate = {
  id: string;
  name: string;
  stage: Stage;
  appliedAt: Date;
  job: { title: string };
};

// Space only: Enter must still follow the card link.
const keyboardCodes = { start: ["Space"], cancel: ["Escape"], end: ["Space"] };

export function KanbanBoard({ candidates }: { candidates: BoardCandidate[] }) {
  const [items, setItems] = useState(candidates);
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => setItems(candidates), [candidates]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { keyboardCodes }),
  );

  async function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    const card = items.find((c) => c.id === active.id);
    const stage = over?.id as Stage | undefined;
    if (!card || !stage || stage === card.stage) return;

    setItems(items.map((c) => (c.id === card.id ? { ...c, stage } : c)));
    const result = await updateCandidateStage(card.id, stage);
    if (result.ok) {
      toast.success(`Moved ${card.name} to ${STAGE_LABELS[stage]}`);
    } else {
      setItems((cur) => cur.map((c) => (c.id === card.id ? { ...c, stage: card.stage } : c)));
      toast.error(result.error);
    }
  }

  const activeCard = items.find((c) => c.id === activeId);

  return (
    <DndContext
      id="kanban-board"
      sensors={sensors}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <Column key={stage} stage={stage} items={items.filter((c) => c.stage === stage)} />
        ))}
      </div>
      <DragOverlay>{activeCard && <CandidateCardOverlay candidate={activeCard} />}</DragOverlay>
    </DndContext>
  );
}

function Column({ stage, items }: { stage: Stage; items: BoardCandidate[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "bg-muted/50 flex w-72 shrink-0 flex-col rounded-lg border p-3 transition-colors",
        isOver && "bg-accent ring-primary/40 ring-2",
      )}
    >
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
}
