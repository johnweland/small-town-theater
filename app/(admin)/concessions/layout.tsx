import type { ReactNode } from "react";

import { forbidden, redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { getStaffSession } from "@/lib/auth/server";

export default async function ConcessionsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getStaffSession();

  if (!session.isAuthenticated) {
    redirect("/admin/sign-in");
  }

  if (!session.isAdmin) {
    forbidden();
  }

  return <AdminShell userEmail={session.email}>{children}</AdminShell>;
}
