import { generateClient } from "aws-amplify/data/server";
import { runWithAmplifyServerContext } from "aws-amplify/adapter-core";
import { parseAmplifyConfig } from "aws-amplify/utils";

import outputs from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";

const config = parseAmplifyConfig(outputs);
const client = generateClient<Schema>({ config });
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
