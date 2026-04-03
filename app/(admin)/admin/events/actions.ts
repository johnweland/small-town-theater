"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createEventInAmplify,
  deleteManagedStorageObjectByUrl,
  deleteEventInAmplify,
  getEventFromAmplify,
  updateEventInAmplify,
} from "@/lib/amplify/server";
import { createAdminNoticeHref } from "@/lib/admin/notice";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function toDateTime(value: string, label: string) {
  if (!value) {
    throw new Error(`${label} is required.`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} must be a valid date and time.`);
  }

  return date.toISOString();
}

function revalidateEventPaths(eventId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath("/admin/events/new");

  if (eventId) {
    revalidatePath(`/admin/events/${eventId}`);
  }
}

export async function createEventAction(formData: FormData) {
  const title = getString(formData, "title");
  const slug = getString(formData, "slug");
  const theaterId = getString(formData, "theaterId");
  const summary = getString(formData, "summary");
  const description = getString(formData, "description");
  const image = getString(formData, "image");
  const status = getString(formData, "status");
  const startsAt = toDateTime(getString(formData, "startsAt"), "Start time");
  const endsAt = toDateTime(getString(formData, "endsAt"), "End time");

  if (!title || !slug || !theaterId || !summary) {
    throw new Error("Title, slug, theater, and summary are required.");
  }

  if (status !== "draft" && status !== "published" && status !== "archived") {
    throw new Error("Invalid event status.");
  }

  if (new Date(endsAt) < new Date(startsAt)) {
    throw new Error("End time must be after the start time.");
  }

  const result = await createEventInAmplify({
    title,
    slug,
    theaterId,
    summary,
    description: description || undefined,
    image: image || undefined,
    status,
    startsAt,
    endsAt,
  });

  if (result.errors?.length) {
    throw new Error(
      `Unable to create event: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  if (!result.data) {
    throw new Error("The event could not be created.");
  }

  revalidateEventPaths(result.data.id);
  redirect(
    createAdminNoticeHref(`/admin/events/${result.data.id}`, {
      type: "success",
      message: "Event created successfully.",
    })
  );
}

export async function updateEventAction(formData: FormData) {
  const id = getString(formData, "id");
  const title = getString(formData, "title");
  const slug = getString(formData, "slug");
  const theaterId = getString(formData, "theaterId");
  const summary = getString(formData, "summary");
  const description = getString(formData, "description");
  const image = getString(formData, "image");
  const status = getString(formData, "status");
  const startsAt = toDateTime(getString(formData, "startsAt"), "Start time");
  const endsAt = toDateTime(getString(formData, "endsAt"), "End time");

  if (!id || !title || !slug || !theaterId || !summary) {
    throw new Error("Missing required event fields.");
  }

  if (status !== "draft" && status !== "published" && status !== "archived") {
    throw new Error("Invalid event status.");
  }

  if (new Date(endsAt) < new Date(startsAt)) {
    throw new Error("End time must be after the start time.");
  }

  const existingEvent = await getEventFromAmplify(id);

  if (existingEvent.errors?.length) {
    throw new Error(
      `Unable to load the existing event: ${existingEvent.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  const result = await updateEventInAmplify({
    id,
    title,
    slug,
    theaterId,
    summary,
    description: description || null,
    image: image || null,
    status,
    startsAt,
    endsAt,
  });

  if (result.errors?.length) {
    throw new Error(
      `Unable to update event: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  await deleteManagedStorageObjectByUrl(
    existingEvent.data?.image && existingEvent.data.image !== image
      ? existingEvent.data.image
      : null
  );

  revalidateEventPaths(id);
  redirect(
    createAdminNoticeHref(`/admin/events/${id}`, {
      type: "success",
      message: "Event saved successfully.",
    })
  );
}

export async function deleteEventAction(formData: FormData) {
  const id = getString(formData, "id");

  if (!id) {
    throw new Error("Missing event id.");
  }

  const existingEvent = await getEventFromAmplify(id);

  if (existingEvent.errors?.length) {
    throw new Error(
      `Unable to load the existing event: ${existingEvent.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  const result = await deleteEventInAmplify(id);

  if (result.errors?.length) {
    throw new Error(
      `Unable to delete event: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  await deleteManagedStorageObjectByUrl(existingEvent.data?.image);

  revalidateEventPaths(id);
  redirect(
    createAdminNoticeHref("/admin/events", {
      type: "success",
      message: "Event deleted successfully.",
    })
  );
}
