import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AdminStatusBadge({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  if (!status) {
    return null;
  }

  const normalized = status.toLowerCase();

  const palette =
    normalized === "active" || normalized === "published" || normalized === "now-playing"
      ? "border-primary/30 bg-primary/10 text-primary"
      : normalized === "coming-soon" || normalized === "seasonal"
        ? "border-tertiary/30 bg-tertiary/10 text-tertiary"
        : normalized === "draft"
          ? "border-secondary/30 bg-secondary/10 text-secondary"
          : "border-border/40 bg-surface-container-high text-muted-foreground";

  return (
    <Badge
      variant="outline"
      className={cn("border px-3 py-1 text-[10px]", palette, className)}
    >
      {status.replace("-", " ")}
    </Badge>
  );
}
