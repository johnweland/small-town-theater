import type { ReactNode } from "react";

import { Table } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function AdminDataTable({
  children,
  className,
  tableClassName,
}: {
  children: ReactNode;
  className?: string;
  tableClassName?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border/20 bg-surface-container-low",
        className
      )}
    >
      <Table className={tableClassName}>{children}</Table>
    </div>
  );
}
