import Link from "next/link";

import { CandidateForm } from "@/components/candidates/candidate-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewCandidatePage() {
  const jobs = await db.job.findMany({
    where: { status: "OPEN" },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/candidates" className="text-muted-foreground text-sm hover:underline">
        ← Candidates
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>New candidate</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidateForm jobs={jobs} />
        </CardContent>
      </Card>
    </div>
  );
}
