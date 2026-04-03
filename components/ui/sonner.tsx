"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  LoaderCircle,
  X,
} from "lucide-react";
import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      theme="dark"
      position="bottom-right"
      closeButton
      visibleToasts={4}
      offset={32}
      gap={14}
      icons={{
        success: <CheckCircle2 />,
        info: <Info />,
        warning: <AlertTriangle />,
        error: <AlertTriangle />,
        loading: <LoaderCircle className="animate-spin" />,
        close: <X />,
      }}
      toastOptions={{
        duration: 4000,
        unstyled: true,
        classNames: {
          toast:
            "group relative flex w-[min(420px,calc(100vw-2rem))] items-center gap-5 overflow-visible border border-border/15 bg-surface-container-low pl-0 pr-6 py-0 shadow-xl shadow-black/35 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary",
          content: "flex min-w-0 flex-1 items-center gap-5 py-6 pr-3",
          icon: "ml-5 flex size-17 shrink-0 items-center justify-center bg-surface-container-high text-primary [&_svg]:size-7 [&_svg]:stroke-[1.75]",
          title:
            "font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground",
          description: "mt-1 text-sm leading-6 text-muted-foreground",
          closeButton:
            "absolute -right-2 -top-2 z-10 flex size-9 items-center justify-center rounded-full border border-black/35 bg-black text-white/80 shadow-md shadow-black/35 transition-colors hover:bg-black/90 hover:text-white [&_svg]:size-4",
          success: "before:bg-primary [&_.group\\[data-type\\=success\\]]:before:bg-primary",
          info: "before:bg-primary",
          warning: "before:bg-secondary [&_[data-slot=sonner-toast-icon]]:text-secondary",
          error: "before:bg-secondary [&_[data-slot=sonner-toast-icon]]:text-secondary",
          loading: "before:bg-primary",
          actionButton:
            "inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-fixed-dim",
          cancelButton:
            "inline-flex h-9 items-center justify-center rounded-md border border-border/30 bg-surface-container-high px-3 text-sm text-foreground transition-colors hover:bg-surface-container-highest",
        },
      }}
    />
  );
}
