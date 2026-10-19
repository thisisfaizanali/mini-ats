import Link from "next/link";

import { formatDate } from "@/lib/format";
import type { BoardCandidate } from "./kanban-board";

export function CandidateCard({ candidate }: { candidate: BoardCandidate }) {
  return (
    <Link
      href={`/candidates/${candidate.id}`}
      className="bg-card hover:bg-accent block rounded-md border p-3 shadow-xs transition-colors"
    >
      <p className="font-medium">{candidate.name}</p>
      <p className="text-muted-foreground text-sm">{candidate.job.title}</p>
      <p className="text-muted-foreground mt-1 text-xs">{formatDate(candidate.appliedAt)}</p>
    </Link>
  );
}
