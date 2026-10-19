import Link from "next/link";
import { notFound } from "next/navigation";

import { CandidateForm } from "@/components/candidates/candidate-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = await db.candidate.findUnique({ where: { id } });
  if (!candidate) notFound();

  // Open jobs, plus the current one even if it has since closed.
  const jobs = await db.job.findMany({
    where: { OR: [{ status: "OPEN" }, { id: candidate.jobId }] },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href={`/candidates/${id}`} className="text-muted-foreground text-sm hover:underline">
        ← {candidate.name}
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Edit candidate</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidateForm
            jobs={jobs}
            candidateId={id}
            defaultValues={{
              name: candidate.name,
              email: candidate.email,
              phone: candidate.phone ?? "",
              jobId: candidate.jobId,
              source: candidate.source,
              skills: candidate.skills.join(", "),
              resumeUrl: candidate.resumeUrl ?? "",
              notes: candidate.notes ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
