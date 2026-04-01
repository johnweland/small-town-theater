"use client";

import { useState } from "react";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";

import { ensureAmplifyConfigured } from "@/lib/amplify/client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
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
      variant="outline"
      size="sm"
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
    >
      <LogOut className="size-4" />
      <span>{isPending ? "Signing out..." : "Sign out"}</span>
    </Button>
  );
}
