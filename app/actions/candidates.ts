"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { type ActionResult, validationError } from "@/lib/action-result";
import { db } from "@/lib/db";
import { candidateSchema } from "@/lib/validations";

const jobNotOpen: ActionResult = {
  ok: false,
  error: "Please fix the highlighted fields",
  fieldErrors: { jobId: ["This job is not open"] },
};

async function isOpenJob(jobId: string) {
  const job = await db.job.findUnique({ where: { id: jobId }, select: { status: true } });
  return job?.status === "OPEN";
}

function knownError(err: unknown, fallback: string): ActionResult {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return {
        ok: false,
        error: "Please fix the highlighted fields",
        fieldErrors: { email: ["A candidate with this email already exists"] },
      };
    }
    if (err.code === "P2025") return { ok: false, error: "Candidate not found" };
  }
  return { ok: false, error: fallback };
}

function revalidate(id: string) {
  revalidatePath("/candidates");
  revalidatePath(`/candidates/${id}`);
  revalidatePath("/jobs");
}

export async function createCandidate(input: unknown): Promise<ActionResult> {
  const parsed = candidateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  let id: string;
  try {
    if (!(await isOpenJob(parsed.data.jobId))) return jobNotOpen;
    // Nested create: candidate + first StageChange in one atomic write.
    ({ id } = await db.candidate.create({
      data: { ...parsed.data, history: { create: { fromStage: null, toStage: "APPLIED" } } },
      select: { id: true },
    }));
  } catch (err) {
    return knownError(err, "Could not create the candidate");
  }
  revalidate(id);
  return { ok: true, id };
}

export async function updateCandidate(id: string, input: unknown): Promise<ActionResult> {
  const parsed = candidateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;

  try {
    const current = await db.candidate.findUnique({ where: { id }, select: { jobId: true } });
    if (current && current.jobId !== data.jobId && !(await isOpenJob(data.jobId))) {
      return jobNotOpen;
    }
    // null, not undefined, so clearing an optional field actually clears it.
    await db.candidate.update({
      where: { id },
      data: {
        ...data,
        phone: data.phone ?? null,
        resumeUrl: data.resumeUrl ?? null,
        notes: data.notes ?? null,
      },
    });
  } catch (err) {
    return knownError(err, "Could not update the candidate");
  }
  revalidate(id);
  return { ok: true, id };
}

export async function deleteCandidate(id: string): Promise<ActionResult> {
  try {
    // Stage history goes with it via onDelete: Cascade.
    await db.candidate.delete({ where: { id } });
  } catch (err) {
    return knownError(err, "Could not delete the candidate");
  }
  revalidatePath("/candidates");
  revalidatePath("/jobs");
  return { ok: true };
}
