"use client";

import type { Job } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";

import { createJob, updateJob } from "@/app/actions/jobs";
import { JobForm } from "@/components/jobs/job-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { JobOutput } from "@/lib/validations";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: Job;
};

export function JobDialog({ open, onOpenChange, job }: Props) {
  async function onSubmit(values: JobOutput) {
    const result = job ? await updateJob(job.id, values) : await createJob(values);
    if (result.ok) {
      onOpenChange(false);
      toast.success(job ? "Job updated" : "Job created");
    } else {
      toast.error(result.error);
    }
    return result;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{job ? "Edit job" : "New job"}</DialogTitle>
          <DialogDescription>
            {job ? "Update the details of this role." : "Add a new open role."}
          </DialogDescription>
        </DialogHeader>
        <JobForm
          defaultValues={
            job && {
              title: job.title,
              department: job.department,
              location: job.location,
              status: job.status,
              description: job.description ?? "",
            }
          }
          onSubmit={onSubmit}
          submitLabel={job ? "Save changes" : "Create job"}
        />
      </DialogContent>
    </Dialog>
  );
}

export function NewJobButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>New job</Button>
      <JobDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
