"use client";

import { useMemo, useState } from "react";

import type { AdminBooking, AdminMovie, AdminScreen, AdminTheater } from "@/lib/admin";
import { BookingSubmitButton } from "@/components/admin/booking-submit-button";
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
import { Button } from "@/components/ui/button";

export function AdminBookingForm({
  theaters,
  screens,
  movies,
  booking,
  createAction,
  defaultMovieId,
}: {
  theaters: AdminTheater[];
  screens: AdminScreen[];
  movies: AdminMovie[];
  booking?: AdminBooking | null;
  createAction?: (formData: FormData) => void | Promise<void>;
  defaultMovieId?: string;
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
  const selectedScreen =
    screensForTheater.find((screen) => screen.id === effectiveScreenId) ?? null;
  const selectedTheater = theaters.find((theater) => theater.id === theaterId) ?? null;
  const selectedMovieId =
    booking
      ? movies.find((movie) => movie.slug === booking.movieSlug)?.id ?? movies[0]?.id ?? ""
      : defaultMovieId && movies.some((movie) => movie.id === defaultMovieId)
        ? defaultMovieId
        : movies[0]?.id ?? "";

  const formSections = (
    <>
      <input type="hidden" name="theaterSlug" value={selectedTheater?.slug ?? ""} />
      <input type="hidden" name="screenName" value={selectedScreen?.name ?? ""} />
      <input
        type="hidden"
        name="movieSlug"
        value={movies.find((movie) => movie.id === selectedMovieId)?.slug ?? ""}
      />

      <AdminSectionCard
        title="Run Details"
        description="Define the theater, screen, movie, and window for this booking."
      >
        <AdminFieldGrid>
          <AdminField label="Theater">
            <AdminSelect
              name="theaterId"
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
              name="screenId"
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
            <AdminSelect name="movieId" defaultValue={selectedMovieId}>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label="Status">
            <AdminSelect name="status" defaultValue={booking?.status ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </AdminSelect>
          </AdminField>
          <AdminField label="Run Start Date">
            <AdminInput
              name="runStartsOn"
              type="date"
              defaultValue={booking?.runStartsOn ?? "2026-04-18"}
            />
          </AdminField>
          <AdminField label="Run End Date">
            <AdminInput
              name="runEndsOn"
              type="date"
              defaultValue={booking?.runEndsOn ?? "2026-04-27"}
            />
          </AdminField>
          <AdminField label="Ticket Price">
            <AdminInput
              name="ticketPrice"
              defaultValue={booking?.ticketPrice ?? "$8"}
              placeholder="$8"
            />
          </AdminField>
          <AdminField label="Public Badge">
            <AdminInput
              name="badge"
              defaultValue={booking?.badge ?? ""}
              placeholder="Senior Matinee"
            />
          </AdminField>
        </AdminFieldGrid>
      </AdminSectionCard>

      <AdminSectionCard
        title="Recurring Showtimes"
        description="Define the weekly pattern for this booking."
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
                  name={`showtime-${day}`}
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
              name="exceptions"
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
              name="note"
              defaultValue={booking?.note ?? ""}
              placeholder="Premium pricing on Friday late show"
            />
          </AdminField>
          <div className="grid gap-3 md:grid-cols-2">
            <AdminCheckbox
              name="featureOnDashboard"
              label="Feature on dashboard"
              defaultChecked
            />
            <AdminCheckbox
              name="publishPublicShowtimes"
              label="Publish public showtimes immediately"
              defaultChecked={booking ? booking.status === "published" : true}
            />
          </div>
        </div>
      </AdminSectionCard>
    </>
  );

  if (!createAction) {
    return (
      <AdminMockForm
        submitLabel={booking ? "Save Booking" : "Create Booking Draft"}
        submitDescription="The theater, screen, and schedule details are all ready for review."
      >
        {formSections}
      </AdminMockForm>
    );
  }

  return (
    <form action={createAction} className="flex flex-col gap-8">
      {formSections}
      <div className="flex flex-col gap-4 rounded-lg bg-surface-container-high p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-sans text-sm font-semibold text-foreground">
            Booking workflow
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Creating this booking will persist the schedule and then redirect to its detail page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="reset" variant="outline">
            Reset
          </Button>
          <BookingSubmitButton idleLabel="Create Booking" />
        </div>
      </div>
    </form>
  );
}
