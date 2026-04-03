"use client";

import { useActionState } from "react";

import { createStaffInviteFromSettingsAction, type StaffInviteActionState } from "@/app/(admin)/admin/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: StaffInviteActionState = {
  expiresInHours: 24,
};

export function StaffInviteForm() {
  const [state, formAction, isPending] = useActionState(
    createStaffInviteFromSettingsAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          Staff email
        </span>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          required
        />
      </label>

      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-semibold text-primary">
          <span className="transition-transform group-open:rotate-90">{">"}</span>
          <span className="flex-1 border-t border-primary/35" />
          <span className="uppercase tracking-[0.18em]">Advanced options</span>
          <span className="flex-1 border-t border-primary/35" />
        </summary>
        <div className="mt-4 flex flex-col gap-2 pl-7">
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            Invite expires in hours
          </span>
          <Input
            name="expiresInHours"
            type="number"
            min="1"
            max="168"
            defaultValue={state.expiresInHours ?? 24}
            required
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Default is 24 hours. Only open this if you need a shorter or longer invite window.
          </p>
        </div>
      </details>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      {state.inviteUrl ? (
        <div className="flex flex-col gap-3 rounded-xl bg-surface-container-high p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Invite ready</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Copy the link or open a prefilled email draft to send it to the staff member.
            </p>
          </div>
          <p className="break-all text-sm text-muted-foreground">{state.inviteUrl}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="sm" variant="outline">
              <a href={state.inviteUrl}>Open invite link</a>
            </Button>
            {state.inviteEmailHref ? (
              <Button asChild size="sm">
                <a href={state.inviteEmailHref}>Open email draft</a>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating invite..." : "Create invite"}
        </Button>
      </div>
    </form>
  );
}
