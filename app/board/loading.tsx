import { Skeleton } from "@/components/ui/skeleton";
import { STAGES } from "@/lib/stages";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
        <Skeleton className="h-9 w-full sm:w-56" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {STAGES.map((s) => (
          <Skeleton key={s} className="h-96 w-72 shrink-0" />
        ))}
      </div>
    </div>
  );
}
