"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createBookingInAmplify,
  deleteBookingInAmplify,
  getBookingFromAmplify,
  updateBookingInAmplify,
} from "@/lib/amplify/server";
import { createAdminNoticeHref } from "@/lib/admin/notice";

const bookingDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type BookingLifecycleStatus = "draft" | "published" | "archived";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

function toSlugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseBookingFormData(formData: FormData) {
  const theaterId = getString(formData, "theaterId");
  const theaterSlug = getString(formData, "theaterSlug");
  const screenId = getString(formData, "screenId");
  const screenName = getString(formData, "screenName");
  const movieId = getString(formData, "movieId");
  const movieSlug = getString(formData, "movieSlug");
  const status = getString(formData, "status");
  const publishPublicShowtimes = getBoolean(formData, "publishPublicShowtimes");
  const runStartsOn = getString(formData, "runStartsOn");
  const runEndsOn = getString(formData, "runEndsOn");
  const ticketPrice = getString(formData, "ticketPrice");
  const badge = getString(formData, "badge");
  const note = getString(formData, "note");
  const exceptionsInput = getString(formData, "exceptions");

  if (!theaterId || !screenId || !movieId || !screenName || !movieSlug) {
    throw new Error("Missing required booking relationships.");
  }

  if (
    status !== "draft" &&
    status !== "published" &&
    status !== "archived"
  ) {
    throw new Error("Invalid booking status.");
  }

  const effectiveStatus: BookingLifecycleStatus =
    status === "archived"
      ? "archived"
      : publishPublicShowtimes
        ? "published"
        : status;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(runStartsOn) || !/^\d{4}-\d{2}-\d{2}$/.test(runEndsOn)) {
    throw new Error("Run dates must be valid ISO dates.");
  }

  const showtimes = bookingDays.flatMap((day) => {
    const raw = getString(formData, `showtime-${day}`);
    const times = raw
      .split(",")
      .map((time) => time.trim())
      .filter(Boolean);

    return times.length ? [{ day, times }] : [];
  });

  if (showtimes.length === 0) {
    throw new Error("Add at least one showtime before saving the booking.");
  }

  const exceptions = exceptionsInput
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const [date, ...labelParts] = line.split("—");
      const normalizedDate = date?.trim();
      const label = labelParts.join("—").trim();

      if (!normalizedDate || !label || !/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
        return [];
      }

      return [{ date: normalizedDate, label }];
    });

  return {
    badge,
    effectiveStatus,
    exceptions,
    movieId,
    movieSlug,
    note,
    runEndsOn,
    runStartsOn,
    screenId,
    screenName,
    showtimes,
    status,
    theaterId,
    theaterSlug,
    ticketPrice,
  };
}

function revalidateBookingPaths(params: {
  bookingId?: string;
  movieId?: string;
  theaterSlug?: string;
}) {
  revalidatePath("/admin");
  revalidatePath("/admin/schedule");
  revalidatePath("/admin/schedule/new");
  revalidatePath("/admin/movies");
  revalidatePath("/showtimes");
  revalidatePath("/");

  if (params.bookingId) {
    revalidatePath(`/admin/schedule/${params.bookingId}`);
  }

  if (params.movieId) {
    revalidatePath(`/admin/movies/${params.movieId}`);
  }

  if (params.theaterSlug) {
    revalidatePath(`/theaters/${params.theaterSlug}`);
  }
}

export async function createBookingAction(formData: FormData) {
  const {
    badge,
    effectiveStatus,
    exceptions,
    movieId,
    movieSlug,
    note,
    runEndsOn,
    runStartsOn,
    screenId,
    screenName,
    showtimes,
    theaterId,
    theaterSlug,
    ticketPrice,
  } = parseBookingFormData(formData);

  const slugBase = [movieSlug, theaterSlug || theaterId, runStartsOn]
    .map(toSlugPart)
    .filter(Boolean)
    .join("-");

  const result = await createBookingInAmplify({
    slug: `${slugBase}-${randomUUID().slice(0, 8)}`,
    theaterId,
    movieId,
    screenId,
    screenName,
    status: effectiveStatus,
    runStartsOn,
    runEndsOn,
    ticketPrice: ticketPrice || undefined,
    badge: badge || undefined,
    showtimes,
    exceptions: exceptions.length ? exceptions : undefined,
    note: note || undefined,
    publishedAt:
      effectiveStatus === "published" ? new Date().toISOString() : undefined,
    expiresAtEpoch:
      effectiveStatus === "published"
        ? Math.floor(new Date(`${runEndsOn}T23:59:59Z`).getTime() / 1000)
        : undefined,
  });

  if (result.errors?.length) {
    throw new Error(
      `Unable to create booking: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  if (!result.data) {
    throw new Error("The booking could not be created.");
  }

  revalidateBookingPaths({
    bookingId: result.data.id,
    movieId,
    theaterSlug,
  });

  redirect(
    createAdminNoticeHref(`/admin/schedule/${result.data.id}`, {
      type: "success",
      message: "Booking created successfully.",
    })
  );
}

export async function updateBookingAction(bookingId: string, formData: FormData) {
  if (!bookingId) {
    throw new Error("Missing booking id.");
  }

  const existingBooking = await getBookingFromAmplify(bookingId);

  if (existingBooking.errors?.length) {
    throw new Error(
      `Unable to load the existing booking: ${existingBooking.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  if (!existingBooking.data) {
    throw new Error("The booking could not be found.");
  }

  const {
    badge,
    effectiveStatus,
    exceptions,
    movieId,
    note,
    runEndsOn,
    runStartsOn,
    screenId,
    screenName,
    showtimes,
    theaterId,
    theaterSlug,
    ticketPrice,
  } = parseBookingFormData(formData);

  const result = await updateBookingInAmplify({
    id: bookingId,
    theaterId,
    movieId,
    screenId,
    screenName,
    status: effectiveStatus,
    runStartsOn,
    runEndsOn,
    ticketPrice: ticketPrice || null,
    badge: badge || null,
    showtimes,
    exceptions: exceptions.length ? exceptions : null,
    note: note || null,
    publishedAt:
      effectiveStatus === "published" ? new Date().toISOString() : null,
    expiresAtEpoch:
      effectiveStatus === "published"
        ? Math.floor(new Date(`${runEndsOn}T23:59:59Z`).getTime() / 1000)
        : null,
  });

  if (result.errors?.length) {
    throw new Error(
      `Unable to update booking: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  revalidateBookingPaths({
    bookingId,
    movieId,
    theaterSlug,
  });

  redirect(
    createAdminNoticeHref(`/admin/schedule/${bookingId}`, {
      type: "success",
      message: "Booking saved successfully.",
    })
  );
}

export async function deleteBookingAction(formData: FormData) {
  const bookingId = getString(formData, "id");

  if (!bookingId) {
    throw new Error("Missing booking id.");
  }

  const existingBooking = await getBookingFromAmplify(bookingId);

  if (existingBooking.errors?.length) {
    throw new Error(
      `Unable to load the existing booking: ${existingBooking.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  if (!existingBooking.data) {
    throw new Error("The booking could not be found.");
  }

  const result = await deleteBookingInAmplify(bookingId);

  if (result.errors?.length) {
    throw new Error(
      `Unable to delete booking: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  revalidateBookingPaths({
    bookingId,
    movieId: existingBooking.data.movieId,
  });

  redirect(
    createAdminNoticeHref("/admin/schedule", {
      type: "success",
      message: "Booking deleted successfully.",
    })
  );
}
