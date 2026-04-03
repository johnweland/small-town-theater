import { generateClient } from "aws-amplify/data/server";
import { getUrl, remove } from "aws-amplify/storage/server";
import { parseAmplifyConfig } from "aws-amplify/utils";

import outputs from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";
import { runWithAuthServerContext } from "@/lib/auth/server";
import { getAmplifyStoragePathFromUrl } from "@/lib/amplify/storage";

const config = parseAmplifyConfig(outputs);
const client = generateClient<Schema>({ config });

function getEventModel() {
  const eventModel = (client.models as Record<string, unknown>).Event;

  if (!eventModel) {
    throw new Error(
      "Events are not available right now."
    );
  }

  return eventModel as {
    list: (...args: unknown[]) => unknown;
    get: (...args: unknown[]) => unknown;
    create: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
    delete: (...args: unknown[]) => unknown;
  };
}

export async function listTheatersFromAmplify() {
  return runWithAuthServerContext((contextSpec) =>
    client.models.Theater.list(contextSpec, {
      authMode: "userPool",
      sortDirection: "ASC",
    })
  );
}

export async function getTheaterFromAmplify(theaterId: string) {
  return runWithAuthServerContext((contextSpec) =>
    client.models.Theater.get(contextSpec, { id: theaterId }, { authMode: "userPool" })
  );
}

export async function listScreensFromAmplify(theaterId?: string) {
  return runWithAuthServerContext((contextSpec) =>
    theaterId
      ? client.models.Screen.listScreensByTheater(
          contextSpec,
          { theaterId },
          { authMode: "userPool" }
        )
      : client.models.Screen.list(contextSpec, {
          authMode: "userPool",
          sortDirection: "ASC",
        })
  );
}

export async function getScreenFromAmplify(screenId: string) {
  return runWithAuthServerContext((contextSpec) =>
    client.models.Screen.get(contextSpec, { id: screenId }, { authMode: "userPool" })
  );
}

export async function listMoviesFromAmplify() {
  return runWithAuthServerContext((contextSpec) =>
    client.models.Movie.list(contextSpec, {
      authMode: "userPool",
      sortDirection: "DESC",
    })
  );
}

export async function getMovieFromAmplify(movieId: string) {
  return runWithAuthServerContext((contextSpec) =>
    client.models.Movie.get(contextSpec, { id: movieId }, { authMode: "userPool" })
  );
}

export async function listBookingsFromAmplify() {
  return runWithAuthServerContext((contextSpec) =>
    client.models.Booking.list(contextSpec, {
      authMode: "userPool",
      sortDirection: "ASC",
    })
  );
}

export async function getBookingFromAmplify(bookingId: string) {
  return runWithAuthServerContext((contextSpec) =>
    client.models.Booking.get(contextSpec, { id: bookingId }, { authMode: "userPool" })
  );
}

export async function listEventsFromAmplify() {
  const eventModel = getEventModel();

  return runWithAuthServerContext((contextSpec) =>
    eventModel.list(contextSpec, {
      authMode: "userPool",
      sortDirection: "ASC",
    })
  ) as Promise<{
    data: Schema["Event"]["type"][];
    errors?: { message: string }[];
  }>;
}

export async function getEventFromAmplify(eventId: string) {
  const eventModel = getEventModel();

  return runWithAuthServerContext((contextSpec) =>
    eventModel.get(contextSpec, { id: eventId }, { authMode: "userPool" })
  ) as Promise<{
    data: Schema["Event"]["type"] | null;
    errors?: { message: string }[];
  }>;
}

export async function createEventInAmplify(input: Schema["Event"]["createType"]) {
  const eventModel = getEventModel();

  return runWithAuthServerContext((contextSpec) =>
    eventModel.create(contextSpec, input, { authMode: "userPool" })
  ) as Promise<{
    data: Schema["Event"]["type"] | null;
    errors?: { message: string }[];
  }>;
}

export async function updateEventInAmplify(input: Schema["Event"]["updateType"]) {
  const eventModel = getEventModel();

  return runWithAuthServerContext((contextSpec) =>
    eventModel.update(contextSpec, input, { authMode: "userPool" })
  ) as Promise<{
    data: Schema["Event"]["type"] | null;
    errors?: { message: string }[];
  }>;
}

export async function deleteEventInAmplify(id: string) {
  const eventModel = getEventModel();

  return runWithAuthServerContext((contextSpec) =>
    eventModel.delete(contextSpec, { id }, { authMode: "userPool" })
  ) as Promise<{
    data: Schema["Event"]["type"] | null;
    errors?: { message: string }[];
  }>;
}

export async function resolveProtectedStorageUrl(url?: string | null) {
  const path = getAmplifyStoragePathFromUrl(url);

  if (!url || !path) {
    return url ?? null;
  }

  return runWithAuthServerContext(async (contextSpec) => {
    const result = await getUrl(contextSpec, {
      path,
      options: {
        validateObjectExistence: true,
      },
    });

    return result.url.toString();
  });
}

export async function deleteManagedStorageObjectByUrl(url?: string | null) {
  const path = getAmplifyStoragePathFromUrl(url);

  if (!url || !path) {
    return;
  }

  await runWithAuthServerContext(async (contextSpec) => {
    await remove(contextSpec, { path }).result;
  });
}

export async function createBookingInAmplify(
  input: Schema["Booking"]["createType"]
) {
  return runWithAuthServerContext((contextSpec) =>
    client.models.Booking.create(contextSpec, input, { authMode: "userPool" })
  );
}
