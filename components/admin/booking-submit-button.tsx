"use client";

import { AdminSubmitButton } from "@/components/admin/admin-submit-button";

export function BookingSubmitButton({
  idleLabel,
}: {
  idleLabel: string;
}) {
  return <AdminSubmitButton idleLabel={idleLabel} />;
}
