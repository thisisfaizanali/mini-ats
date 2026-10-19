import { NextRequest } from "next/server";

import {
  buildCandidateOrderBy,
  buildCandidateWhere,
  parseCandidateParams,
} from "@/lib/candidate-query";
import { toCsv } from "@/lib/csv";
import { db } from "@/lib/db";
import { SOURCE_LABELS, STAGE_LABELS } from "@/lib/stages";

export async function GET(request: NextRequest) {
  const params = parseCandidateParams(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  try {
    const candidates = await db.candidate.findMany({
      where: buildCandidateWhere(params),
      orderBy: buildCandidateOrderBy(params.sort),
      select: {
        name: true,
        email: true,
        phone: true,
        job: { select: { title: true } },
        stage: true,
        source: true,
        skills: true,
        appliedAt: true,
      },
    });
    const rows = [
      [
        "Name",
        "Email",
        "Phone",
        "Job",
        "Stage",
        "Source",
        "Skills",
        "Applied At",
      ],
      ...candidates.map((c) => [
        c.name,
        c.email,
        c.phone ?? "",
        c.job.title,
        STAGE_LABELS[c.stage],
        SOURCE_LABELS[c.source],
        c.skills.join("; "),
        c.appliedAt.toISOString().slice(0, 10),
      ]),
    ];
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    return new Response(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="candidates-${today}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Failed to export candidates.", { status: 500 });
  }
}
