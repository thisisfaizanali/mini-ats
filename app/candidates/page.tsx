import type { Metadata } from "next";
import { Download, Users } from "lucide-react";
import Link from "next/link";

import { CandidateFilters } from "@/components/candidates/candidate-filters";
import { Pagination } from "@/components/candidates/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  buildCandidateOrderBy,
  buildCandidateWhere,
  hasActiveFilters,
  PAGE_SIZE,
  parseCandidateParams,
} from "@/lib/candidate-query";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { SOURCE_LABELS, STAGE_BADGE_CLASSES, STAGE_LABELS } from "@/lib/stages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Candidates" };

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = parseCandidateParams(sp);
  const where = buildCandidateWhere(params);
  const [total, jobs] = await Promise.all([
    db.candidate.count({ where }),
    db.job.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);
  const exportParams = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (key === "page") continue;
    for (const v of [value].flat())
      if (v !== undefined) exportParams.append(key, v);
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(params.page, totalPages);
  const candidates = await db.candidate.findMany({
    where,
    orderBy: buildCandidateOrderBy(params.sort),
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { job: { select: { title: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Candidates</h1>
          <p className="text-muted-foreground text-sm">
            {total} {total === 1 ? "candidate" : "candidates"}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {total > 0 && (
            <Button asChild variant="outline">
              <a href={`/candidates/export?${exportParams}`} download>
                <Download />
                Export CSV
              </a>
            </Button>
          )}
          <Button asChild>
            <Link href="/candidates/new">New candidate</Link>
          </Button>
        </div>
      </div>

      <CandidateFilters jobs={jobs} />

      {total === 0 && hasActiveFilters(params) ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-12 text-center">
          <Users className="text-muted-foreground size-8" />
          <p className="font-medium">No candidates match your filters</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/candidates">Clear filters</Link>
          </Button>
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-12 text-center">
          <Users className="text-muted-foreground size-8" />
          <p className="font-medium">No candidates yet</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/candidates/new">Add a candidate</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link
                      href={`/candidates/${c.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.name}
                    </Link>
                    <div className="text-muted-foreground text-xs">
                      {c.email}
                    </div>
                  </TableCell>
                  <TableCell>{c.job.title}</TableCell>
                  <TableCell>
                    <Badge className={STAGE_BADGE_CLASSES[c.stage]}>
                      {STAGE_LABELS[c.stage]}
                    </Badge>
                  </TableCell>
                  <TableCell>{SOURCE_LABELS[c.source]}</TableCell>
                  <TableCell>{formatDate(c.appliedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        searchParams={sp}
      />
    </div>
  );
}
