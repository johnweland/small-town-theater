import { generateClient } from "aws-amplify/data/server";
import { getUrl } from "aws-amplify/storage/server";
import { runWithAmplifyServerContext } from "aws-amplify/adapter-core";
import { parseAmplifyConfig } from "aws-amplify/utils";

import outputs from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";
import { runWithGuestServerContext } from "@/lib/auth/server";
import { getAmplifyStoragePathFromUrl } from "@/lib/amplify/storage";

const config = parseAmplifyConfig(outputs);
const client = generateClient<Schema>({ config });
function getPublicEventModel() {
  const eventModel = (client.models as Record<string, unknown>).Event;

  if (!eventModel) {
    throw new Error(
      "Amplify Event model is unavailable in the current deployment. Deploy the updated Amplify schema before using public events."
    );
  }

  return eventModel as {
    list: (...args: unknown[]) => unknown;
  };
}
const publicTheaterSelection = [
  "id",
  "slug",
  "name",
  "city",
  "state",
  "district",
  "established",
  "status",
  "address",
  "phone",
  "contactEmail",
  "manager",
  "heroImage",
  "descriptionParagraphs",
  "createdAt",
  "updatedAt",
] as const;
const publicScreenSelection = [
  "id",
  "theaterId",
  "name",
  "slug",
  "capacity",
  "sortOrder",
  "projection",
  "soundFormat",
  "features",
  "status",
  "createdAt",
  "updatedAt",
] as const;
const publicMovieSelection = [
  "id",
  "slug",
  "title",
  "tagline",
  "rating",
  "runtime",
  "genre",
  "status",
  "director",
  "cast",
  "synopsis",
  "production",
  "score",
  "cinematography",
  "backdrop",
  "poster",
  "releaseDate",
  "audienceScore",
  "originalLanguage",
  "productionCompanies",
  "tmdbId",
  "trailerYouTubeId",
  "createdAt",
  "updatedAt",
] as const;
const publicBookingSelection = [
  "id",
  "slug",
  "theaterId",
  "movieId",
  "screenId",
  "screenName",
  "status",
  "runStartsOn",
  "runEndsOn",
  "ticketPrice",
  "badge",
  "showtimes.day",
  "showtimes.times",
  "exceptions.date",
  "exceptions.label",
  "createdAt",
  "updatedAt",
] as const;
const publicEventSelection = [
  "id",
  "slug",
  "theaterId",
  "title",
  "summary",
  "description",
  "image",
  "status",
  "startsAt",
  "endsAt",
  "createdAt",
  "updatedAt",
] as const;

export async function listPublicTheatersFromAmplify() {
  return runWithAmplifyServerContext(config, {}, (contextSpec) =>
    client.models.Theater.list(contextSpec, {
      authMode: "apiKey",
      sortDirection: "ASC",
      selectionSet: publicTheaterSelection,
    })
  );
}

export async function listPublicScreensFromAmplify(theaterId: string) {
  return runWithAmplifyServerContext(config, {}, (contextSpec) =>
    client.models.Screen.listScreensByTheater(
      contextSpec,
      { theaterId },
      {
        authMode: "apiKey",
        selectionSet: publicScreenSelection,
      }
    )
  );
}

export async function listPublicMoviesFromAmplify() {
  return runWithAmplifyServerContext(config, {}, (contextSpec) =>
    client.models.Movie.list(contextSpec, {
      authMode: "apiKey",
      sortDirection: "DESC",
      selectionSet: publicMovieSelection,
    })
  );
}

export async function listPublicBookingsFromAmplify() {
  return runWithAmplifyServerContext(config, {}, (contextSpec) =>
    client.models.Booking.list(contextSpec, {
      authMode: "apiKey",
      sortDirection: "ASC",
      selectionSet: publicBookingSelection,
    })
  );
}

export async function listPublicEventsFromAmplify() {
  const eventModel = getPublicEventModel();

  return runWithAmplifyServerContext(config, {}, (contextSpec) =>
    eventModel.list(contextSpec, {
      authMode: "apiKey",
      sortDirection: "ASC",
      selectionSet: publicEventSelection,
    })
  ) as Promise<{
    data: Schema["Event"]["type"][];
    errors?: { message: string }[];
  }>;
}

export async function resolvePublicStorageUrl(url?: string | null) {
  const path = getAmplifyStoragePathFromUrl(url);

  if (!url || !path) {
    return url ?? null;
  }

  return runWithGuestServerContext(async (contextSpec) => {
    const result = await getUrl(contextSpec, {
      path,
      options: {
        validateObjectExistence: true,
      },
    });

    return result.url.toString();
  });
}
