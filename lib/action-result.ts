import { z } from "zod";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export function validationError(err: z.ZodError): ActionResult {
  return {
    ok: false,
    error: "Please fix the highlighted fields",
    fieldErrors: z.flattenError(err).fieldErrors,
  };
}
