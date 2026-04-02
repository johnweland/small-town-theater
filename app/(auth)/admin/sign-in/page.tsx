import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { getStaffSession } from "@/lib/auth/server";

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; created?: string }>;
}) {
  const session = await getStaffSession();
  const { email = "", created } = await searchParams;

  if (session.isAuthenticated && session.isAdmin) {
    redirect("/admin");
  }

  return (
    <SignInForm
      initialEmail={email}
      created={created === "1"}
    />
  );
}
