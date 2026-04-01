import type { ReactNode } from "react";

import { Table } from "@/components/ui/table";

export function AdminDataTable({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/20 bg-surface-container-low">
      <Table>{children}</Table>
    </div>
  );
}
