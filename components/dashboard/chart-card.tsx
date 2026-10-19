import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const chartClass = "aspect-auto h-[260px] w-full";

export function ChartCard({
  title,
  description,
  empty,
  className,
  children,
}: {
  title: string;
  description: string;
  empty?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{empty ? <EmptyState>No data yet</EmptyState> : children}</CardContent>
    </Card>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground flex h-[260px] items-center justify-center rounded-md border border-dashed text-sm">
      {children}
    </p>
  );
}
