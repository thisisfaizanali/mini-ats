import { Stage } from "@prisma/client";

import { db } from "@/lib/db";
import { SOURCE_LABELS, STAGES } from "@/lib/stages";

const DAY = 24 * 60 * 60 * 1000;

export async function getKpis() {
  const [total, active, openJobs, hiredChanges] = await Promise.all([
    db.candidate.count(),
    db.candidate.count({ where: { stage: { notIn: [Stage.HIRED, Stage.REJECTED] } } }),
    db.job.count({ where: { status: "OPEN" } }),
    db.stageChange.findMany({
      where: { toStage: Stage.HIRED },
      select: { candidateId: true, changedAt: true, candidate: { select: { stage: true, appliedAt: true } } },
    }),
  ]);

  // A candidate can be hired, moved out and hired again, so raw HIRED rows would
  // count them twice. Keep one (latest) hire per candidate who is still HIRED.
  const latest = new Map<string, { changedAt: Date; appliedAt: Date }>();
  for (const h of hiredChanges) {
    if (h.candidate.stage !== Stage.HIRED) continue;
    const cur = latest.get(h.candidateId);
    if (!cur || h.changedAt > cur.changedAt) {
      latest.set(h.candidateId, { changedAt: h.changedAt, appliedAt: h.candidate.appliedAt });
    }
  }
  const hires = [...latest.values()];
  const since = Date.now() - 30 * DAY;
  const hiredLast30 = hires.filter((h) => h.changedAt.getTime() >= since).length;
  const avgDaysToHire = hires.length
    ? Math.round(
        (hires.reduce((sum, h) => sum + (h.changedAt.getTime() - h.appliedAt.getTime()) / DAY, 0) /
          hires.length) *
          10,
      ) / 10
    : null;

  return { total, active, openJobs, hiredLast30, avgDaysToHire };
}

export async function getStageCounts() {
  const rows = await db.candidate.groupBy({ by: ["stage"], _count: { _all: true } });
  const counts = new Map(rows.map((r) => [r.stage, r._count._all]));
  return STAGES.map((stage) => ({ stage, count: counts.get(stage) ?? 0 }));
}

export async function getSourceCounts() {
  const rows = await db.candidate.groupBy({ by: ["source"], _count: { _all: true } });
  return rows
    .map((r) => ({ source: SOURCE_LABELS[r.source], count: r._count._all }))
    .sort((a, b) => b.count - a.count);
}

const weekLabel = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Kolkata",
});

export async function getWeeklyApplications() {
  const now = Date.now();
  const start = now - 84 * DAY;
  const rows = await db.candidate.findMany({
    where: { appliedAt: { gt: new Date(start) } },
    select: { appliedAt: true },
  });
  const buckets = Array.from({ length: 12 }, (_, i) => ({
    week: weekLabel.format(new Date(start + i * 7 * DAY)),
    count: 0,
  }));
  for (const { appliedAt } of rows) {
    const i = Math.min(11, Math.floor((appliedAt.getTime() - start) / (7 * DAY)));
    if (i >= 0) buckets[i].count++;
  }
  return buckets;
}

export async function getPipelineByJob() {
  const [jobs, rows] = await Promise.all([
    db.job.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.candidate.groupBy({ by: ["jobId", "stage"], _count: { _all: true } }),
  ]);
  return jobs.map((job) => {
    const row = { job: job.title } as { job: string } & Record<Stage, number>;
    for (const stage of STAGES) row[stage] = 0;
    for (const r of rows) if (r.jobId === job.id) row[r.stage] = r._count._all;
    return row;
  });
}

export function getRecentActivity() {
  return db.stageChange.findMany({
    orderBy: { changedAt: "desc" },
    take: 8,
    select: {
      id: true,
      fromStage: true,
      toStage: true,
      changedAt: true,
      candidate: { select: { id: true, name: true, job: { select: { title: true } } } },
    },
  });
}
