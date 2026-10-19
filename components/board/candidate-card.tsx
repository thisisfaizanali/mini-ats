"use client";

import { useDraggable } from "@dnd-kit/core";
import Link from "next/link";

import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BoardCandidate } from "./kanban-board";

const cardClass = "bg-card block rounded-md border p-3 shadow-xs";

function CardBody({ candidate }: { candidate: BoardCandidate }) {
  return (
    <>
      <p className="font-medium">{candidate.name}</p>
      <p className="text-muted-foreground text-sm">{candidate.job.title}</p>
      <p className="text-muted-foreground mt-1 text-xs">{formatDate(candidate.appliedAt)}</p>
    </>
  );
}

export function CandidateCard({ candidate }: { candidate: BoardCandidate }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: candidate.id,
    data: { stage: candidate.stage },
  });

  return (
    <Link
      ref={setNodeRef}
      href={`/candidates/${candidate.id}`}
      {...listeners}
      {...attributes}
      role={undefined} // keep link semantics; dnd-kit sets role="button"
      className={cn(cardClass, "hover:bg-accent touch-none transition-colors", isDragging && "opacity-40")}
    >
      <CardBody candidate={candidate} />
    </Link>
  );
}

export function CandidateCardOverlay({ candidate }: { candidate: BoardCandidate }) {
  return (
    <div className={cn(cardClass, "cursor-grabbing shadow-lg")}>
      <CardBody candidate={candidate} />
    </div>
  );
}
