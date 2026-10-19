"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { type ActionResult, validationError } from "@/lib/action-result";
import { db } from "@/lib/db";
import { jobSchema } from "@/lib/validations";

export async function createJob(input: unknown): Promise<ActionResult> {
  const parsed = jobSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    await db.job.create({ data: parsed.data });
  } catch {
    return { ok: false, error: "Could not create the job" };
  }
  revalidatePath("/jobs");
  return { ok: true };
}

export async function updateJob(id: string, input: unknown): Promise<ActionResult> {
  const parsed = jobSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    // null, not undefined, so clearing the description actually clears it.
    await db.job.update({
      where: { id },
      data: { ...parsed.data, description: parsed.data.description ?? null },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return { ok: false, error: "Job not found" };
    }
    return { ok: false, error: "Could not update the job" };
  }
  revalidatePath("/jobs");
  return { ok: true };
}

export async function deleteJob(id: string): Promise<ActionResult> {
  try {
    const n = await db.candidate.count({ where: { jobId: id } });
    if (n > 0) {
      return {
        ok: false,
        error: `This job has ${n} candidate(s). Move or delete them first.`,
      };
    }
    await db.job.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Could not delete the job" };
  }
  revalidatePath("/jobs");
  return { ok: true };
}
