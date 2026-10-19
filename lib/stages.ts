import { Source, Stage } from "@prisma/client";

export const STAGES: Stage[] = [
  Stage.APPLIED,
  Stage.SCREENING,
  Stage.INTERVIEW,
  Stage.OFFER,
  Stage.HIRED,
  Stage.REJECTED,
];

export const STAGE_LABELS: Record<Stage, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

export const STAGE_BADGE_CLASSES: Record<Stage, string> = {
  APPLIED: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  SCREENING: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
  INTERVIEW: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200",
  OFFER: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  HIRED: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
};

export const SOURCE_LABELS: Record<Source, string> = {
  LINKEDIN: "LinkedIn",
  REFERRAL: "Referral",
  JOB_BOARD: "Job board",
  CAREERS_PAGE: "Careers page",
  OTHER: "Other",
};

// Mid-tone hues matching the badges; readable on light and dark backgrounds.
export const STAGE_CHART_COLORS: Record<Stage, string> = {
  APPLIED: "#94a3b8",
  SCREENING: "#0ea5e9",
  INTERVIEW: "#8b5cf6",
  OFFER: "#f59e0b",
  HIRED: "#22c55e",
  REJECTED: "#ef4444",
};
