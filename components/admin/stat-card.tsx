import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function AdminStatCard({
  label,
  value,
  meta,
  accent,
  icon,
}: {
  label: string;
  value: string;
  meta?: string;
  accent?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Card className="border border-border/20 bg-surface-container-low shadow-md shadow-black/20">
      <CardContent className="flex min-h-32 flex-col justify-between gap-6 pt-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            {label}
          </p>
          {icon}
        </div>
        <div>
          <p
            className={
              accent
                ? "font-serif text-4xl italic text-primary"
                : "font-serif text-4xl italic text-foreground"
            }
          >
            {value}
          </p>
          {meta ? (
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {meta}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
