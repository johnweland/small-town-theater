import Link from "next/link";

import { BootstrapInviteForm } from "@/components/auth/bootstrap-invite-form";

export default function AdminBootstrapPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <BootstrapInviteForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an invite?{" "}
          <Link className="text-primary underline-offset-4 hover:underline" href="/admin/sign-in">
            Go to staff sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
