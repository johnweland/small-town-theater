"use client";

import Link from "next/link";

import type { AdminTheater } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminScreenForm } from "@/components/admin/screen-form";

export function NewScreenForm({ theater }: { theater: AdminTheater }) {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="New Screen"
        title={`Add a screen for ${theater.name}`}
        description="Capture the room configuration that scheduling and public theater details depend on."
        action={
          <Button asChild variant="outline">
            <Link href={`/admin/theaters/${theater.id}/screens`}>Back to Screens</Link>
          </Button>
        }
      />
      <AdminScreenForm theater={theater} />
    </div>
  );
}
