import { Prisma, Source, Stage } from "@prisma/client";
import { z } from "zod";

export const SORTS = ["newest", "oldest", "name_asc", "name_desc"] as const;
export type Sort = (typeof SORTS)[number];

export const PAGE_SIZE = 10;

export type CandidateParams = {
  q: string;
  stage?: Stage;
  jobId?: string;
  source?: Source;
  sort: Sort;
  page: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parseCandidateParams(sp: SearchParams): CandidateParams {
  const sort = first(sp.sort);
  const page = Number(first(sp.page));
  return {
    q: first(sp.q)?.trim() ?? "",
    stage: z.enum(Stage).safeParse(first(sp.stage)).data,
    jobId: first(sp.job) || undefined,
    source: z.enum(Source).safeParse(first(sp.source)).data,
    sort: SORTS.includes(sort as Sort) ? (sort as Sort) : "newest",
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

export function buildCandidateWhere(p: CandidateParams): Prisma.CandidateWhereInput {
  const and: Prisma.CandidateWhereInput[] = [];
  if (p.q) {
    and.push({
      OR: [
        { name: { contains: p.q, mode: "insensitive" } },
        { email: { contains: p.q, mode: "insensitive" } },
        { skills: { has: p.q.toLowerCase() } },
      ],
    });
  }
  if (p.stage) and.push({ stage: p.stage });
  if (p.jobId) and.push({ jobId: p.jobId });
  if (p.source) and.push({ source: p.source });
  return { AND: and };
}

export function buildCandidateOrderBy(sort: Sort): Prisma.CandidateOrderByWithRelationInput[] {
  const primary: Record<Sort, Prisma.CandidateOrderByWithRelationInput> = {
    newest: { appliedAt: "desc" },
    oldest: { appliedAt: "asc" },
    name_asc: { name: "asc" },
    name_desc: { name: "desc" },
  };
  return [primary[sort], { id: "asc" }];
}

export function hasActiveFilters(p: CandidateParams) {
  return Boolean(p.q || p.stage || p.jobId || p.source);
}
