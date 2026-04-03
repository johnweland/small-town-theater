"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function AdminSubmitButton({
  idleLabel,
  pendingLabel = "Saving...",
}: {
  idleLabel: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
