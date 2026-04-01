"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { AdminTheater } from "@/lib/admin";
import { getAmplifyClient } from "@/lib/amplify/client";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSectionCard } from "@/components/admin/section-card";
import {
  AdminField,
  AdminFieldGrid,
  AdminInput,
  AdminSelect,
} from "@/components/admin/admin-form";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

const featureOptions = [
  { name: "wheelchairRow", label: "Wheelchair seating row" },
  { name: "privateRentals", label: "Private rentals allowed" },
  { name: "assistedListening", label: "Assisted listening available" },
  { name: "eventStaging", label: "Supports event staging" },
] as const;

export function NewScreenForm({ theater }: { theater: AdminTheater }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="New Screen"
        title={`Add a screen for ${theater.name}`}
        description="Room configuration is now stored in Amplify so scheduling and public theater details can depend on it."
        action={
          <Button asChild variant="outline">
            <Link href={`/admin/theaters/${theater.id}/screens`}>Back to Screens</Link>
          </Button>
        }
      />

      <form
        className="flex flex-col gap-8"
        onSubmit={(event) => {
          event.preventDefault();

          const formData = new FormData(event.currentTarget);
          setError(null);

          startTransition(() => {
            void (async () => {
              const client = getAmplifyClient();
              if (!client.models.Screen) {
                setError(
                  "The Screen model is not available in the local Amplify client yet. Deploy or sandbox-sync the updated backend so amplify_outputs.json includes Screen, then reload this page."
                );
                return;
              }

              const capacity = Number.parseInt(getString(formData, "capacity"), 10);
              const sortOrder = Number.parseInt(getString(formData, "sortOrder"), 10);
              const features = featureOptions
                .filter((option) => formData.get(option.name) === "on")
                .map((option) => option.label);

              const response = await client.models.Screen.create(
                {
                  theaterId: theater.id,
                  name: getString(formData, "name"),
                  slug: getString(formData, "slug"),
                  capacity,
                  sortOrder,
                  projection: getString(formData, "projection"),
                  soundFormat: getString(formData, "soundFormat"),
                  features,
                  status: getString(formData, "status") as "active" | "inactive",
                },
                { authMode: "userPool" }
              );

              if (response.errors?.length) {
                setError(response.errors.map((item) => item.message).join("; "));
                return;
              }

              router.push(`/admin/theaters/${theater.id}/screens`);
              router.refresh();
            })();
          });
        }}
      >
        <AdminSectionCard
          title="Screen Configuration"
          description="Capture the operational fields that bookings and public theater details can depend on."
        >
          <AdminFieldGrid>
            <AdminField label="Name">
              <AdminInput name="name" placeholder="Balcony Screen" required />
            </AdminField>
            <AdminField label="Slug">
              <AdminInput name="slug" placeholder="balcony-screen" required />
            </AdminField>
            <AdminField label="Capacity">
              <AdminInput name="capacity" type="number" placeholder="80" required />
            </AdminField>
            <AdminField label="Sort Order">
              <AdminInput name="sortOrder" type="number" defaultValue="1" required />
            </AdminField>
            <AdminField label="Projection">
              <AdminInput name="projection" placeholder="4K Laser" required />
            </AdminField>
            <AdminField label="Sound Format">
              <AdminInput name="soundFormat" placeholder="Dolby 7.1" required />
            </AdminField>
            <AdminField label="Status">
              <AdminSelect name="status" defaultValue="active">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </AdminSelect>
            </AdminField>
          </AdminFieldGrid>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-md bg-surface-container-high px-3 py-2 text-sm">
              <input
                name="wheelchairRow"
                type="checkbox"
                defaultChecked
                className="size-4 accent-[var(--primary)]"
              />
              <span>Wheelchair seating row</span>
            </label>
            <label className="flex items-center gap-3 rounded-md bg-surface-container-high px-3 py-2 text-sm">
              <input
                name="privateRentals"
                type="checkbox"
                className="size-4 accent-[var(--primary)]"
              />
              <span>Private rentals allowed</span>
            </label>
            <label className="flex items-center gap-3 rounded-md bg-surface-container-high px-3 py-2 text-sm">
              <input
                name="assistedListening"
                type="checkbox"
                defaultChecked
                className="size-4 accent-[var(--primary)]"
              />
              <span>Assisted listening available</span>
            </label>
            <label className="flex items-center gap-3 rounded-md bg-surface-container-high px-3 py-2 text-sm">
              <input
                name="eventStaging"
                type="checkbox"
                className="size-4 accent-[var(--primary)]"
              />
              <span>Supports event staging</span>
            </label>
          </div>
        </AdminSectionCard>

        <div className="flex flex-col gap-4 rounded-lg bg-surface-container-high p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-sans text-sm font-semibold text-foreground">
              Amplify-backed workflow
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              New screens are now created in AppSync and will appear in the admin
              screen list after save.
            </p>
            {error ? (
              <p className="mt-2 text-sm text-destructive">{error}</p>
            ) : null}
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Screen"}
          </Button>
        </div>
      </form>
    </div>
  );
}
