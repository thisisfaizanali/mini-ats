"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SOURCE_LABELS, STAGE_LABELS, STAGES } from "@/lib/stages";

const ALL = "all";

const SORT_LABELS = {
  newest: "Newest first",
  oldest: "Oldest first",
  name_asc: "Name A–Z",
  name_desc: "Name Z–A",
};

export function CandidateFilters({ jobs }: { jobs: { id: string; title: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(urlQ);

  // Re-sync when the URL changes from outside (Back button, Clear).
  useEffect(() => setQ(urlQ), [urlQ]);

  function href(key: string, value: string, defaultValue: string) {
    const next = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  useEffect(() => {
    if (q.trim() === urlQ) return;
    const t = setTimeout(() => router.replace(href("q", q.trim(), ""), { scroll: false }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const select = (key: string, label: string, options: [string, string][], defaultValue = ALL) => (
    <Select
      value={searchParams.get(key) ?? defaultValue}
      onValueChange={(v) => router.push(href(key, v, defaultValue), { scroll: false })}
    >
      <SelectTrigger aria-label={label} className="w-full sm:w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([value, text]) => (
          <SelectItem key={value} value={value}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const active = ["q", "stage", "job", "source"].some((k) => searchParams.get(k));

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <Input
        aria-label="Search candidates"
        placeholder="Search name, email, or skill"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="sm:w-64"
      />
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {select("stage", "Filter by stage", [[ALL, "All stages"], ...STAGES.map((s): [string, string] => [s, STAGE_LABELS[s]])])}
        {select("job", "Filter by job", [[ALL, "All jobs"], ...jobs.map((j): [string, string] => [j.id, j.title])])}
        {select("source", "Filter by source", [[ALL, "All sources"], ...Object.entries(SOURCE_LABELS)])}
        {select("sort", "Sort by", Object.entries(SORT_LABELS), "newest")}
      </div>
      {active && (
        <Button variant="ghost" onClick={() => router.push(pathname, { scroll: false })}>
          Clear
        </Button>
      )}
    </div>
  );
}
