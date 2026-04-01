"use client";

import { useMemo, useState } from "react";

import type { AdminBooking, AdminMovie, AdminScreen, AdminTheater } from "@/lib/admin";
import { AdminSectionCard } from "@/components/admin/section-card";
import {
  AdminCheckbox,
  AdminField,
  AdminFieldGrid,
  AdminInput,
  AdminMockForm,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/admin-form";

export function AdminBookingForm({
  theaters,
  screens,
  movies,
  booking,
}: {
  theaters: AdminTheater[];
  screens: AdminScreen[];
  movies: AdminMovie[];
  booking?: AdminBooking | null;
}) {
  const initialTheaterId = booking?.theaterId ?? theaters[0]?.id ?? "";
  const [theaterId, setTheaterId] = useState(initialTheaterId);
  const screensForTheater = useMemo(
    () => screens.filter((screen) => screen.theaterId === theaterId),
    [screens, theaterId]
  );
  const [screenId, setScreenId] = useState(booking?.screenId ?? "");
  const effectiveScreenId =
    screensForTheater.length === 1
      ? screensForTheater[0].id
      : screensForTheater.some((screen) => screen.id === screenId)
        ? screenId
        : (screensForTheater[0]?.id ?? "");

  return (
    <AdminMockForm
      submitLabel={booking ? "Save Booking" : "Create Booking Draft"}
      submitDescription="The theater, screen, and schedule form states are all wired so persistence can be added later with minimal refactor."
    >
      <AdminSectionCard
        title="Run Details"
        description="Define the theater, screen, movie, and window for this booking."
      >
        <AdminFieldGrid>
          <AdminField label="Theater">
            <AdminSelect
              value={theaterId}
              onChange={(event) => {
                const nextTheaterId = event.target.value;
                const nextScreens = screens.filter(
                  (screen) => screen.theaterId === nextTheaterId
                );
                setTheaterId(nextTheaterId);
                setScreenId(
                  nextScreens.length === 1
                    ? nextScreens[0].id
                    : (nextScreens[0]?.id ?? "")
                );
              }}
            >
              {theaters.map((theater) => (
                <option key={theater.id} value={theater.id}>
                  {theater.name}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField
            label="Screen"
            description={
              screensForTheater.length === 1
                ? "Auto-selected because this theater currently has one active scheduling target."
                : undefined
            }
          >
            <AdminSelect
              value={effectiveScreenId}
              onChange={(event) => setScreenId(event.target.value)}
            >
              {screensForTheater.map((screen) => (
                <option key={screen.id} value={screen.id}>
                  {screen.name}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label="Movie">
            <AdminSelect defaultValue={booking?.movieSlug ?? movies[0]?.slug}>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.slug}>
                  {movie.title}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label="Status">
            <AdminSelect defaultValue={booking?.status ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </AdminSelect>
          </AdminField>
          <AdminField label="Run Start Date">
            <AdminInput
              type="date"
              defaultValue={booking?.runStartsOn ?? "2026-04-18"}
            />
          </AdminField>
          <AdminField label="Run End Date">
            <AdminInput
              type="date"
              defaultValue={booking?.runEndsOn ?? "2026-04-27"}
            />
          </AdminField>
        </AdminFieldGrid>
      </AdminSectionCard>

      <AdminSectionCard
        title="Recurring Showtimes"
        description="Model the weekly pattern now so it can later map directly to a persisted schedule object."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => {
            const entry = booking?.showtimes.find((showtime) => showtime.day === day);
            return (
              <div key={day} className="rounded-lg bg-surface-container-high p-4">
                <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                  {day}
                </p>
                <AdminInput
                  className="mt-3"
                  defaultValue={entry?.times.join(", ") ?? ""}
                  placeholder="2:00 PM, 7:00 PM"
                />
              </div>
            );
          })}
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Exceptions & Publishing"
        description="Keep unusual dates and rollout notes close to the booking itself."
      >
        <div className="flex flex-col gap-5">
          <AdminField label="Exceptions">
            <AdminTextarea
              defaultValue={
                booking?.exceptions
                  .map((exception) => `${exception.date} — ${exception.label}`)
                  .join("\n") ?? ""
              }
              placeholder="2026-04-12 — Closed Sunday for donor reception"
            />
          </AdminField>
          <AdminField label="Internal Notes">
            <AdminTextarea
              defaultValue={booking?.note ?? ""}
              placeholder="Premium pricing on Friday late show"
            />
          </AdminField>
          <div className="grid gap-3 md:grid-cols-2">
            <AdminCheckbox label="Feature on dashboard" defaultChecked />
            <AdminCheckbox
              label="Publish public showtimes immediately"
              defaultChecked={booking?.status === "published"}
            />
          </div>
        </div>
      </AdminSectionCard>
    </AdminMockForm>
  );
}
