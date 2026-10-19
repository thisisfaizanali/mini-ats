import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteCandidateButton } from "@/components/candidates/delete-candidate-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { SOURCE_LABELS, STAGE_BADGE_CLASSES, STAGE_LABELS } from "@/lib/stages";

export const dynamic = "force-dynamic";

export default async function CandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = await db.candidate.findUnique({ where: { id }, include: { job: true } });
  if (!candidate) notFound();

  return (
    <div className="space-y-6">
      <Link href="/candidates" className="text-muted-foreground text-sm hover:underline">
        ← Candidates
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{candidate.name}</h1>
          <Badge className={STAGE_BADGE_CLASSES[candidate.stage]}>
            {STAGE_LABELS[candidate.stage]}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/candidates/${candidate.id}/edit`}>Edit</Link>
          </Button>
          <DeleteCandidateButton id={candidate.id} name={candidate.name} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <a href={`mailto:${candidate.email}`} className="block break-all hover:underline">
              {candidate.email}
            </a>
            {candidate.phone ? (
              <a href={`tel:${candidate.phone}`} className="block hover:underline">
                {candidate.phone}
              </a>
            ) : (
              <p>—</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{candidate.job.title}</p>
            <p>{SOURCE_LABELS[candidate.source]}</p>
            <p>Applied {formatDate(candidate.appliedAt)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {candidate.skills.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {candidate.resumeUrl ? (
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all hover:underline"
              >
                {candidate.resumeUrl}
              </a>
            ) : (
              "—"
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{candidate.notes || "—"}</CardContent>
        </Card>
      </div>
    </div>
  );
}
