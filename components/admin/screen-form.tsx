"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { AdminScreen, AdminTheater } from "@/lib/admin";
import { createAdminNoticeHref } from "@/lib/admin/notice";
import { getAmplifyClient } from "@/lib/amplify/client";
import { Button } from "@/components/ui/button";
import { AdminSectionCard } from "@/components/admin/section-card";
import { useHydratedFlag } from "@/components/admin/use-hydrated-flag";
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

function getSelectedFeatures(formData: FormData) {
  return featureOptions
    .filter((option) => formData.get(option.name) === "on")
    .map((option) => option.label);
}

export function AdminScreenForm({
  theater,
  screen,
}: {
  theater: AdminTheater;
  screen?: AdminScreen | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(screen);
  const isHydrated = useHydratedFlag();

  return (
    <form
      data-e2e-ready={isHydrated ? "true" : undefined}
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
                "Screen management is not available right now. Refresh the page and try again."
              );
              return;
            }

            const capacity = Number.parseInt(getString(formData, "capacity"), 10);
            const sortOrder = Number.parseInt(getString(formData, "sortOrder"), 10);

            if (Number.isNaN(capacity) || Number.isNaN(sortOrder)) {
              setError("Capacity and sort order must be valid numbers.");
              return;
            }

            const payload = {
              theaterId: theater.id,
              name: getString(formData, "name"),
              slug: getString(formData, "slug"),
              capacity,
              sortOrder,
              projection: getString(formData, "projection"),
              soundFormat: getString(formData, "soundFormat"),
              features: getSelectedFeatures(formData),
              status: getString(formData, "status") as "active" | "inactive",
            };

            const response = isEditing
              ? await client.models.Screen.update(
                  {
                    id: screen!.id,
                    ...payload,
                  },
                  { authMode: "userPool" }
                )
              : await client.models.Screen.create(payload, {
                  authMode: "userPool",
                });

            if (response.errors?.length) {
              setError(response.errors.map((item) => item.message).join("; "));
              return;
            }

            router.push(
              createAdminNoticeHref(
                isEditing
                  ? `/admin/theaters/${theater.id}/screens/${screen!.id}`
                  : `/admin/theaters/${theater.id}/screens`,
                {
                  type: "success",
                  message: isEditing
                    ? "Screen saved successfully."
                    : "Screen created successfully.",
                }
              )
            );
            router.refresh();
          })();
        });
      }}
    >
      <AdminSectionCard
        title={isEditing ? "Room Settings" : "Screen Configuration"}
        description={
          isEditing
            ? "Keep screen details current so scheduling and theater operations stay aligned."
            : "Capture the operational fields that bookings and public theater details can depend on."
        }
      >
        <AdminFieldGrid>
          <AdminField label="Name">
            <AdminInput
              name="name"
              defaultValue={screen?.name ?? ""}
              placeholder="Balcony Screen"
              required
            />
          </AdminField>
          <AdminField label="Slug">
            <AdminInput
              name="slug"
              defaultValue={screen?.slug ?? ""}
              placeholder="balcony-screen"
              required
            />
          </AdminField>
          <AdminField label="Capacity">
            <AdminInput
              name="capacity"
              type="number"
              defaultValue={screen ? String(screen.capacity) : ""}
              placeholder="80"
              required
            />
          </AdminField>
          <AdminField label="Sort Order">
            <AdminInput
              name="sortOrder"
              type="number"
              defaultValue={screen ? String(screen.sortOrder) : "1"}
              required
            />
          </AdminField>
          <AdminField label="Projection">
            <AdminInput
              name="projection"
              defaultValue={screen?.projection ?? ""}
              placeholder="4K Laser"
              required
            />
          </AdminField>
          <AdminField label="Sound Format">
            <AdminInput
              name="soundFormat"
              defaultValue={screen?.soundFormat ?? ""}
              placeholder="Dolby 7.1"
              required
            />
          </AdminField>
          <AdminField label="Status">
            <AdminSelect name="status" defaultValue={screen?.status ?? "active"}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </AdminSelect>
          </AdminField>
        </AdminFieldGrid>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {featureOptions.map((option) => (
            <label
              key={option.name}
              className="flex items-center gap-3 rounded-md bg-surface-container-high px-3 py-2 text-sm"
            >
              <input
                name={option.name}
                type="checkbox"
                defaultChecked={
                  screen ? screen.features.includes(option.label) : option.name !== "privateRentals" && option.name !== "eventStaging"
                }
                className="size-4 accent-[var(--primary)]"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </AdminSectionCard>

      <div className="flex flex-col gap-4 rounded-lg bg-surface-container-high p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-sans text-sm font-semibold text-foreground">
            Screen workflow
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditing
              ? "Saving this screen updates it immediately."
              : "New screens appear in the admin screen list after save."}
          </p>
          {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <Button asChild type="button" variant="outline">
            <Link href={`/admin/theaters/${theater.id}/screens`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save Screen"
                : "Create Screen"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function DeleteScreenButton({
  theaterId,
  screenId,
}: {
  theaterId: string;
  screenId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-lg bg-secondary/10 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-sans text-sm font-semibold text-foreground">
            Retire this screen
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Removing this screen deletes it and returns you to the theater&apos;s screen list.
          </p>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        </div>
        <Button
          type="button"
          variant="destructive"
          disabled={isPending}
          onClick={() => {
            setError(null);

            startTransition(() => {
              void (async () => {
                const client = getAmplifyClient();
                if (!client.models.Screen) {
                  setError(
                    "Screen management is not available right now. Refresh the page and try again."
                  );
                  return;
                }

                const response = await client.models.Screen.delete(
                  { id: screenId },
                  { authMode: "userPool" }
                );

                if (response.errors?.length) {
                  setError(response.errors.map((item) => item.message).join("; "));
                  return;
                }

                router.push(
                  createAdminNoticeHref(`/admin/theaters/${theaterId}/screens`, {
                    type: "success",
                    message: "Screen deleted successfully.",
                  })
                );
                router.refresh();
              })();
            });
          }}
        >
          {isPending ? "Deleting..." : "Delete Screen"}
        </Button>
      </div>
    </div>
  );
}
