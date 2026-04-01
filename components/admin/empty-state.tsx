import type { ReactNode } from "react";

import { Film } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminEmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-surface-container-high px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
        {icon ?? <Film />}
      </div>
      <h3 className="font-serif text-2xl italic text-foreground">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function AdminEmptyStateButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Button asChild>
      <a href={href}>{children}</a>
    </Button>
  );
}
