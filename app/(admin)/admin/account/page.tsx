import { redirect } from "next/navigation";

import { AccountSettingsView } from "@/components/admin/account-settings-view";
import { getStaffSession } from "@/lib/auth/server";

export default async function AdminAccountPage() {
  const session = await getStaffSession();

  if (!session.isAuthenticated) {
    redirect("/admin/sign-in");
  }

  if (!session.email) {
    redirect("/admin");
  }

  return (
    <AccountSettingsView
      initialAvatarUrl={session.avatarUrl}
      initialDisplayName={session.displayName}
      initialEmail={session.email}
      initialGravatarUrl={session.gravatarUrl}
      initialUploadedAvatarUrl={session.uploadedAvatarUrl}
    />
  );
}
