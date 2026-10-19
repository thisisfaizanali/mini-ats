import { Users } from "lucide-react";
import Link from "next/link";

import { CandidateFilters } from "@/components/candidates/candidate-filters";
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
  parseCandidateParams,
} from "@/lib/candidate-query";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { SOURCE_LABELS, STAGE_BADGE_CLASSES, STAGE_LABELS } from "@/lib/stages";

export const dynamic = "force-dynamic";

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseCandidateParams(await searchParams);
  const where = buildCandidateWhere(params);
  const [total, candidates, jobs] = await Promise.all([
    db.candidate.count({ where }),
    db.candidate.findMany({
      where,
      orderBy: buildCandidateOrderBy(params.sort),
      take: 10,
      include: { job: { select: { title: true } } },
    }),
    db.job.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Candidates</h1>
          <p className="text-muted-foreground text-sm">
            {total} {total === 1 ? "candidate" : "candidates"}
          </p>
        </div>
        <Button asChild>
          <Link href="/candidates/new">New candidate</Link>
        </Button>
      </div>

      <CandidateFilters jobs={jobs} />

      {candidates.length === 0 ? (
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
                    <Link href={`/candidates/${c.id}`} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                    <div className="text-muted-foreground text-xs">{c.email}</div>
                  </TableCell>
                  <TableCell>{c.job.title}</TableCell>
                  <TableCell>
                    <Badge className={STAGE_BADGE_CLASSES[c.stage]}>{STAGE_LABELS[c.stage]}</Badge>
                  </TableCell>
                  <TableCell>{SOURCE_LABELS[c.source]}</TableCell>
                  <TableCell>{formatDate(c.appliedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
