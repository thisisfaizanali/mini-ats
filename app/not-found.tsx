import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/">Dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/candidates">Candidates</Link>
        </Button>
      </div>
    </div>
  );
}
