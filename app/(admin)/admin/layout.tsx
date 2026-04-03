import type { ReactNode } from "react";

import { forbidden, redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { getStaffSession } from "@/lib/auth/server";

export default async function ProtectedAdminLayout({
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

  return (
    <AdminShell
      userAvatarUrl={session.avatarUrl}
      userDisplayName={session.displayName}
      userEmail={session.email}
    >
      {children}
    </AdminShell>
  );
}
