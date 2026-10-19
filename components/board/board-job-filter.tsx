"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BoardJobFilter({
  jobs,
  value,
}: {
  jobs: { id: string; title: string }[];
  value: string;
}) {
  const router = useRouter();

  return (
    <Select
      value={value}
      onValueChange={(v) => router.push(v === "all" ? "/board" : `/board?job=${v}`, { scroll: false })}
    >
      <SelectTrigger aria-label="Filter by job" className="w-full sm:w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All jobs</SelectItem>
        {jobs.map((j) => (
          <SelectItem key={j.id} value={j.id}>
            {j.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
