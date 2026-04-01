"use client";

import { useState, type ReactNode } from "react";

import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function AdminField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
        {label}
      </span>
      {children}
      {description ? (
        <span className="text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      ) : null}
    </label>
  );
}

export function AdminFieldGrid({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 md:grid-cols-2",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-md border border-border/40 bg-surface-container-highest px-3 py-2 text-sm text-foreground outline-none focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20",
        className
      )}
      {...props}
    />
  );
}

export function AdminInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...props} />;
}

export function AdminTextarea(props: React.ComponentProps<typeof Textarea>) {
  return <Textarea {...props} />;
}

export function AdminCheckbox({
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-md bg-surface-container-high px-3 py-2 text-sm">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-4 accent-[var(--primary)]"
      />
      <span>{label}</span>
    </label>
  );
}

export function AdminMockForm({
  children,
  submitLabel,
  submitDescription = "Changes are captured in local mock state only for now.",
}: {
  children: ReactNode;
  submitLabel: string;
  submitDescription?: string;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      {children}
      <div className="flex flex-col gap-4 rounded-lg bg-surface-container-high p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-sans text-sm font-semibold text-foreground">
            Frontend-only workflow
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {submitDescription}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved ? (
            <span className="inline-flex items-center gap-2 text-sm text-primary">
              <CheckCircle2 className="size-4" />
              Saved locally
            </span>
          ) : null}
          <Button type="submit">{submitLabel}</Button>
        </div>
      </div>
    </form>
  );
}

export function AdminConfirmDelete({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div className="rounded-lg bg-secondary/10 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="flex items-center gap-2 font-sans text-sm font-semibold text-foreground">
            <AlertTriangle className="size-4 text-secondary" />
            {title}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          {done ? (
            <p className="mt-3 text-sm text-secondary">
              Delete flow confirmed in the UI. No data was actually removed.
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {confirming ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setDone(true);
                  setConfirming(false);
                }}
              >
                <Trash2 data-icon="inline-start" />
                Confirm Delete
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setConfirming(true)}
            >
              <Trash2 data-icon="inline-start" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
