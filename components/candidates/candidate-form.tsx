"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createCandidate, updateCandidate } from "@/app/actions/candidates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SOURCE_LABELS } from "@/lib/stages";
import {
  type CandidateInput,
  type CandidateOutput,
  candidateSchema,
} from "@/lib/validations";

type Props = {
  jobs: { id: string; title: string }[];
  candidateId?: string;
  defaultValues?: CandidateInput;
};

const textFields = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "tel" },
] as const;

export function CandidateForm({ jobs, candidateId, defaultValues }: Props) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CandidateInput, unknown, CandidateOutput>({
    resolver: zodResolver(candidateSchema),
    defaultValues: defaultValues ?? {
      name: "",
      email: "",
      phone: "",
      jobId: "",
      source: "LINKEDIN",
      skills: "",
      resumeUrl: "",
      notes: "",
    },
  });

  const submit = handleSubmit(async (values) => {
    const result = candidateId
      ? await updateCandidate(candidateId, values)
      : await createCandidate(values);
    if (result.ok) {
      toast.success(candidateId ? "Candidate updated" : "Candidate created");
      router.push(`/candidates/${result.id}`);
      return;
    }
    for (const [name, messages] of Object.entries(result.fieldErrors ?? {})) {
      if (messages?.[0]) setError(name as keyof CandidateInput, { message: messages[0] });
    }
    toast.error(result.error);
  });

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {textFields.map(({ name, label, type }) => (
        <div key={name} className="space-y-1.5">
          <Label htmlFor={name}>{label}</Label>
          <Input id={name} type={type} aria-invalid={!!errors[name]} {...register(name)} />
          <FieldError message={errors[name]?.message} />
        </div>
      ))}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="jobId">Job</Label>
          <Controller
            control={control}
            name="jobId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="jobId" className="w-full" aria-invalid={!!errors.jobId}>
                  <SelectValue placeholder="Pick a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.jobId?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="source">Source</Label>
          <Controller
            control={control}
            name="source"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="source" className="w-full" aria-invalid={!!errors.source}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.source?.message} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="skills">Skills</Label>
        <Input id="skills" aria-invalid={!!errors.skills} {...register("skills")} />
        <p className="text-muted-foreground text-xs">
          Comma separated, e.g. react, typescript, node
        </p>
        <FieldError message={errors.skills?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="resumeUrl">Resume URL</Label>
        <Input
          id="resumeUrl"
          type="url"
          placeholder="https://"
          aria-invalid={!!errors.resumeUrl}
          {...register("resumeUrl")}
        />
        <FieldError message={errors.resumeUrl?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={4} aria-invalid={!!errors.notes} {...register("notes")} />
        <FieldError message={errors.notes?.message} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : candidateId ? "Save changes" : "Create candidate"}
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-destructive text-sm">{message}</p> : null;
}
