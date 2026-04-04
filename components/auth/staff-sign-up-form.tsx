"use client";

import { FormEvent, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "aws-amplify/auth";

import { ensureAmplifyConfigured } from "@/lib/amplify/client";
import { STAFF_INVITE_METADATA_KEYS } from "@/lib/auth/staff-invite-constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ReadyInvite = {
  email: string;
  expiresAt: string;
  expiresLabel?: string | null;
  role: "owner" | "staff";
  signature: string;
};

type StaffSignUpFormProps =
  | {
      mode: "invalid";
      invite?: never;
    }
  | {
      mode: "ready";
      invite: ReadyInvite;
    };

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "We could not finish staff setup. Please ask for a new invite link.";
}

function markBootstrapComplete() {
  document.cookie = "staff-bootstrap-complete=1; Path=/; Max-Age=31536000; SameSite=Lax";
}

export function StaffSignUpForm(props: StaffSignUpFormProps) {
  ensureAmplifyConfigured();

  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (props.mode !== "ready") {
      return;
    }

    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const email = props.invite.email.trim().toLowerCase();

    try {
      const inviteMetadata = {
        [STAFF_INVITE_METADATA_KEYS.email]: email,
        [STAFF_INVITE_METADATA_KEYS.expiresAt]: props.invite.expiresAt,
        [STAFF_INVITE_METADATA_KEYS.role]: props.invite.role,
        [STAFF_INVITE_METADATA_KEYS.signature]: props.invite.signature,
      };

      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            "custom:isAdminStaff": "true",
            "custom:isOwner": props.invite.role === "owner" ? "true" : "false",
            email,
            name,
          },
          clientMetadata: inviteMetadata,
          validationData: inviteMetadata,
        },
      });

      if (!result.isSignUpComplete) {
        setError(
          "Your signup needs an extra confirmation step. Ask for a fresh invite if this keeps happening."
        );
        return;
      }

      markBootstrapComplete();
      router.replace(`/admin/sign-in?email=${encodeURIComponent(email)}&created=1`);
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
            Invite-Only Staff Setup
          </p>
          <CardTitle className="font-serif text-4xl italic text-primary">
            Create your theater staff account
          </CardTitle>
          <CardDescription>
            This setup link only works for invited staff accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {props.mode === "invalid" ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                This setup link is incomplete. Ask an administrator for a fresh
                invite URL.
              </p>
              <Button asChild variant="outline">
                <Link href="/admin/sign-in">Return to sign in</Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Staff email
                </label>
                <Input id="email" name="email" type="email" value={props.invite.email} readOnly />
              </div>
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full name
                </label>
                <Input id="name" name="name" autoComplete="name" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Create password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              {props.mode === "ready" && props.invite.expiresLabel ? (
                <p className="text-xs text-muted-foreground">
                  This link expires on {props.invite.expiresLabel}.
                </p>
              ) : null}
              {props.mode === "ready" && props.invite.role === "owner" ? (
                <p className="text-xs text-muted-foreground">
                  This invite grants owner access for managing staff and elevated admin controls.
                </p>
              ) : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? "Creating account..." : "Create staff account"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
