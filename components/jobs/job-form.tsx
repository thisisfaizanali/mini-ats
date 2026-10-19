"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

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
import type { ActionResult } from "@/lib/action-result";
import { type JobInput, type JobOutput, jobSchema } from "@/lib/validations";

type Props = {
  defaultValues?: JobInput;
  onSubmit: (values: JobOutput) => Promise<ActionResult>;
  submitLabel: string;
};

const textFields = [
  { name: "title", label: "Title" },
  { name: "department", label: "Department" },
  { name: "location", label: "Location" },
] as const;

export function JobForm({ defaultValues, onSubmit, submitLabel }: Props) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<JobInput, unknown, JobOutput>({
    resolver: zodResolver(jobSchema),
    defaultValues: defaultValues ?? {
      title: "",
      department: "",
      location: "",
      status: "OPEN",
      description: "",
    },
  });

  const submit = handleSubmit(async (values) => {
    const result = await onSubmit(values);
    if (!result.ok && result.fieldErrors) {
      for (const [name, messages] of Object.entries(result.fieldErrors)) {
        if (messages?.[0]) {
          setError(name as keyof JobInput, { message: messages[0] });
        }
      }
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {textFields.map(({ name, label }) => (
        <div key={name} className="space-y-1.5">
          <Label htmlFor={name}>{label}</Label>
          <Input id={name} aria-invalid={!!errors[name]} {...register(name)} />
          <FieldError message={errors[name]?.message} />
        </div>
      ))}

      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.status?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          aria-invalid={!!errors.description}
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-destructive text-sm">{message}</p> : null;
}
