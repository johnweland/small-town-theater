import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdminSectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card
      className={cn(
        "border border-border/20 bg-surface-container-low shadow-lg shadow-black/20",
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="font-serif text-2xl italic text-foreground">
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="mt-2 max-w-2xl leading-6">
              {description}
            </CardDescription>
          ) : null}
        </div>
        {action}
      </CardHeader>
      <CardContent className={cn("pt-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
