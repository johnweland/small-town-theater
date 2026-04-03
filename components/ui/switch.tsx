"use client";

import * as React from "react";

import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-border/40 bg-surface-container-high outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/20 data-[state=checked]:border-primary/40 data-[state=checked]:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 translate-x-1 rounded-full bg-foreground shadow-sm transition-transform data-[state=checked]:translate-x-5 data-[state=checked]:bg-primary"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
