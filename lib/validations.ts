import { JobStatus, Source, Stage } from "@prisma/client";
import { z } from "zod";

const text = (min: number, max: number) => z
    .string()
    .trim()
    .min(min, `Must be at least ${min} characters`)
    .max(max, `Must be at most ${max} characters`);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be at most ${max} characters`)
    .optional().transform((v) => v || undefined);

export const jobSchema = z.object({
  title: text(2, 100),
  department: text(2, 100),
  location: text(2, 100),
  status: z.enum(JobStatus, "Pick an option"),
  description: optionalText(2000),
});

export const candidateSchema = z.object({
  name: text(2, 100),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  phone: optionalText(20),
  skills: z
    .string()
    .transform((s) => [
      ...new Set(
        s
          .split(",")
          .map((x) => x.trim().toLowerCase())
          .filter(Boolean),
      ),
    ])
    .pipe(
      z
        .array(z.string())
        .min(1, "Add at least one skill")
        .max(15, "Add at most 15 skills"),
    ),
  source: z.enum(Source, "Pick an option"),
  jobId: z.string().min(1, "Pick a job"),
  resumeUrl: z
    .union([z.url("Enter a valid URL (https://...)"), z.literal("")])
    .optional()
    .transform((v) => v || undefined),
  notes: optionalText(2000),
});

export const stageSchema = z.enum(Stage);

export type JobInput = z.input<typeof jobSchema>;
export type JobOutput = z.output<typeof jobSchema>;
export type CandidateInput = z.input<typeof candidateSchema>;
export type CandidateOutput = z.output<typeof candidateSchema>;
