import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PAGE_SIZE } from "@/lib/candidate-query";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  searchParams: Record<string, string | string[] | undefined>;
};

export function Pagination({ page, totalPages, total, searchParams }: Props) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      const value = Array.isArray(v) ? v[0] : v;
      if (value && k !== "page") next.set(k, value);
    }
    if (p > 1) next.set("page", String(p));
    const qs = next.toString();
    return qs ? `/candidates?${qs}` : "/candidates";
  };

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-muted-foreground text-sm">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Button asChild variant="outline" size="sm">
            <Link href={href(page - 1)}>Prev</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Prev
          </Button>
        )}
        {page < totalPages ? (
          <Button asChild variant="outline" size="sm">
            <Link href={href(page + 1)}>Next</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
