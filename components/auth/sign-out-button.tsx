"use client";

import { useState } from "react";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import type { VariantProps } from "class-variance-authority";

import { ensureAmplifyConfigured } from "@/lib/amplify/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  className?: string;
  label?: string;
} & VariantProps<typeof buttonVariants>;

export function SignOutButton({
  className,
  label = "Sign out",
  size = "sm",
  variant = "outline",
}: SignOutButtonProps) {
  ensureAmplifyConfigured();

  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);

    try {
      await signOut();
      router.replace("/admin/sign-in");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className={cn(className)}
    >
      <LogOut className="size-4" />
      <span>{isPending ? "Signing out..." : label}</span>
    </Button>
  );
}
