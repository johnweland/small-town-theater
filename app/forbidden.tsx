import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-5 text-center">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Staff Access Only
        </p>
        <h1 className="font-serif text-4xl italic text-primary">
          Your account is signed in, but it is not approved for admin access.
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Ask a theater administrator to invite you through the staff setup flow
          so your account can be added to the admin group.
        </p>
        <Button asChild>
          <Link href="/admin/sign-in">Return to sign in</Link>
        </Button>
      </div>
    </main>
  );
}
