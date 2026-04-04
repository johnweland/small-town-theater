import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { getStaffSession, hasStaffUsers } from "@/lib/auth/server";

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; created?: string }>;
}) {
  const [session, staffUsersExist] = await Promise.all([
    getStaffSession(),
    hasStaffUsers(),
  ]);
  const cookieStore = await cookies();
  const { email = "", created } = await searchParams;
  const bootstrapCompleted = cookieStore.get("staff-bootstrap-complete")?.value === "1";

  if (session.isAuthenticated && session.isAdmin) {
    redirect("/admin");
  }

  return (
    <SignInForm
      initialEmail={email}
      created={created === "1"}
      showBootstrapInvite={!staffUsersExist && !bootstrapCompleted}
    />
  );
}
