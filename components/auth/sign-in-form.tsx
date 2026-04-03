"use client";

import { FormEvent, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "aws-amplify/auth";

import { ensureAmplifyConfigured } from "@/lib/amplify/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function getStepLabel(step: string) {
  switch (step) {
    case "CONFIRM_SIGN_UP":
      return "Your account still needs confirmation before it can sign in.";
    case "RESET_PASSWORD":
      return "Your password must be reset before continuing.";
    default:
      return `Additional sign-in step required: ${step}.`;
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "We could not sign you in. Please try again.";
}

export function SignInForm({
  initialEmail,
  created,
  showBootstrapInvite,
}: {
  initialEmail: string;
  created: boolean;
  showBootstrapInvite: boolean;
}) {
  ensureAmplifyConfigured();

  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    try {
      const result = await signIn({
        username: email,
        password,
      });

      if (result.nextStep.signInStep !== "DONE") {
        setError(getStepLabel(result.nextStep.signInStep));
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-md border-border/50 bg-card/95">
        <CardHeader className="space-y-3 text-center">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Marquee Admin
          </p>
          <CardTitle className="font-serif text-4xl italic text-primary">
            Theater staff sign in
          </CardTitle>
          <CardDescription>
            Staff access is limited to invited theater accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={initialEmail}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            {created ? (
              <p className="text-sm text-emerald-700">
                Your staff account is ready. Sign in with the password you just
                created.
              </p>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need access? Ask an administrator for a temporary staff setup link.
            {" "}
            <Link className="text-primary underline-offset-4 hover:underline" href="/">
              Return to the public site
            </Link>
          </p>
          {showBootstrapInvite ? (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              First staff account?{" "}
              <Link
                className="text-primary underline-offset-4 hover:underline"
                href="/admin/bootstrap"
              >
                Create a bootstrap invite
              </Link>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
