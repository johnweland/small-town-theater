"use client";

import { useMemo } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminNotice() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const notice = searchParams.get("notice");
  const message = searchParams.get("message");

  const dismissHref = useMemo(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("notice");
    nextParams.delete("message");
    const query = nextParams.toString();

    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  if (!notice || !message) {
    return null;
  }

  const success = notice === "success";

  return (
    <div
      className={
        success
          ? "mb-6 flex items-start justify-between gap-4 rounded-lg border border-primary/20 bg-primary/10 p-4 text-primary"
          : "mb-6 flex items-start justify-between gap-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive"
      }
    >
      <div className="flex items-start gap-3">
        {success ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        ) : (
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        )}
        <p className="text-sm font-medium">{message}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0"
        onClick={() => router.replace(dismissHref)}
      >
        <X />
      </Button>
    </div>
  );
}
