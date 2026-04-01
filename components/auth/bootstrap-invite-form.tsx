"use client";

import { useActionState } from "react";

import { createBootstrapInviteAction, type BootstrapInviteState } from "@/app/(auth)/admin/bootstrap/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialState: BootstrapInviteState = {
  expiresInHours: 24,
};

export function BootstrapInviteForm() {
  const [state, formAction, isPending] = useActionState(
    createBootstrapInviteAction,
    initialState
  );

  return (
    <Card className="w-full max-w-lg border-border/50 bg-card/95">
      <CardHeader className="space-y-3 text-center">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Bootstrap Invite
        </p>
        <CardTitle className="font-serif text-4xl italic text-primary">
          Create the first staff signup link
        </CardTitle>
        <CardDescription>
          Protected by a bootstrap secret so you can mint the first invite
          without using the terminal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="bootstrapSecret" className="text-sm font-medium">
              Bootstrap secret
            </label>
            <Input
              id="bootstrapSecret"
              name="bootstrapSecret"
              type="password"
              autoComplete="off"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Staff email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={state.email}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="expiresInHours" className="text-sm font-medium">
              Expiry in hours
            </label>
            <Input
              id="expiresInHours"
              name="expiresInHours"
              type="number"
              min="1"
              max="168"
              defaultValue={state.expiresInHours ?? 24}
              required
            />
          </div>
          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          {state.inviteUrl ? (
            <div className="space-y-2 rounded-lg bg-surface-container-high p-4">
              <p className="text-sm font-medium text-foreground">Invite link</p>
              <p className="break-all text-sm text-muted-foreground">
                {state.inviteUrl}
              </p>
              <a
                href={state.inviteUrl}
                className="inline-flex text-sm text-primary underline-offset-4 hover:underline"
              >
                Open invite link
              </a>
            </div>
          ) : null}
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Creating invite..." : "Create invite link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
