"use client";

import type { Stage } from "@prisma/client";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateCandidateStage } from "@/app/actions/candidates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STAGE_LABELS, STAGES } from "@/lib/stages";

export function StageSelect({ id, stage }: { id: string; stage: Stage }) {
  const [value, setValue] = useState(stage);
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    const prev = value;
    const nextStage = next as Stage;
    setValue(nextStage);
    startTransition(async () => {
      const result = await updateCandidateStage(id, nextStage);
      if (result.ok) {
        toast.success(`Moved to ${STAGE_LABELS[nextStage]}`);
      } else {
        setValue(prev);
        toast.error(result.error);
      }
    });
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={pending}>
      <SelectTrigger aria-label="Change stage" className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STAGES.map((s) => (
          <SelectItem key={s} value={s}>
            {STAGE_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
