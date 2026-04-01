import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { getStaffSession } from "@/lib/auth/server";

export default async function AdminSignInPage() {
  const session = await getStaffSession();

  if (session.isAuthenticated && session.isAdmin) {
    redirect("/admin");
  }

  return <SignInForm />;
}
