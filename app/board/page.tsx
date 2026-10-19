import type { Metadata } from "next";
import { BoardJobFilter } from "@/components/board/board-job-filter";
import { KanbanBoard } from "@/components/board/kanban-board";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Board" };

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { job: jobParam } = await searchParams;
  const jobs = await db.job.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } });
  const jobId = jobs.some((j) => j.id === jobParam) ? (jobParam as string) : undefined;

  const candidates = await db.candidate.findMany({
    where: jobId ? { jobId } : undefined,
    orderBy: { appliedAt: "desc" },
    select: { id: true, name: true, stage: true, appliedAt: true, job: { select: { title: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Board</h1>
          <p className="text-muted-foreground text-sm">Drag a card to change its stage</p>
        </div>
        <BoardJobFilter jobs={jobs} value={jobId ?? "all"} />
      </div>
      <KanbanBoard candidates={candidates} />
    </div>
  );
}
