import {
  adminBookings,
  adminEvents,
  adminMovies,
  adminRecentActivity,
  importCandidates,
} from "./mock-data";
import { theaters as siteTheaters } from "@/lib/data/theaters";
import { screens as siteScreens } from "@/lib/data/screens";
import {
  listTheatersFromAmplify,
  getTheaterFromAmplify,
  listScreensFromAmplify,
  getScreenFromAmplify,
} from "@/lib/amplify/server";
import {
  getTmdbCredits,
  getTmdbMovieDetails,
  getTmdbSearchResultYear,
  getTmdbTrailerYouTubeId,
  searchTmdbMovies,
} from "@/lib/data/tmdb";
import { getMovieDetail, getMovieShowtimes } from "@/lib/data";

export type {
  AdminActivityItem,
  AdminBooking,
  AdminEvent,
  AdminMovie,
  AdminScreen,
  AdminStatus,
  AdminTheater,
  ImportCandidate,
  RecurringShowtime,
} from "./types";

type AmplifyTheaterRecord = NonNullable<
  Awaited<ReturnType<typeof getTheaterFromAmplify>>["data"]
>;
type AmplifyScreenRecord = NonNullable<
  Awaited<ReturnType<typeof getScreenFromAmplify>>["data"]
>;

function toAdminTheater(
  theater: AmplifyTheaterRecord
) {
  const fallback = siteTheaters.find(
    (siteTheater) =>
      siteTheater.slug === theater.slug || siteTheater.name === theater.name
  );

  return {
    id: theater.id,
    slug: theater.slug,
    name: theater.name,
    city: theater.city,
    state: theater.state,
    district: theater.district,
    established: theater.established ?? fallback?.established ?? 0,
    status: theater.status,
    address: theater.address,
    phone: theater.phone ?? fallback?.phone ?? "",
    contactEmail: theater.contactEmail ?? fallback?.contactEmail ?? "",
    manager: theater.manager ?? fallback?.manager ?? "",
    notes: theater.notes ?? fallback?.notes ?? "",
    heroImage: theater.heroImage ?? fallback?.heroImage ?? "/next.svg",
    descriptionParagraphs: (
      theater.descriptionParagraphs ?? fallback?.descriptionParagraphs ?? []
    ).filter((paragraph): paragraph is string => Boolean(paragraph)),
    specs:
      fallback?.specs ?? [
        { label: "Location", value: theater.address },
        { label: "Phone", value: theater.phone ?? "Not provided" },
        { label: "Status", value: theater.status },
      ],
    concessions: fallback?.concessions ?? [],
  };
}

function toAdminScreen(screen: AmplifyScreenRecord) {
  const fallback = siteScreens.find(
    (siteScreen) =>
      siteScreen.slug === screen.slug || siteScreen.name === screen.name
  );

  return {
    id: screen.id,
    theaterId: screen.theaterId,
    name: screen.name,
    slug: screen.slug,
    capacity: screen.capacity,
    sortOrder: screen.sortOrder,
    projection: screen.projection,
    soundFormat: screen.soundFormat,
    features: (screen.features ?? fallback?.features ?? []).filter(
      (feature): feature is string => Boolean(feature)
    ),
    status: screen.status,
  };
}

export async function getAdminTheaters() {
  const result = await listTheatersFromAmplify();

  if (result.errors?.length) {
    throw new Error(
      `Unable to load theaters from Amplify: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  return result.data.map(toAdminTheater);
}

export async function getAdminTheater(theaterId: string) {
  const result = await getTheaterFromAmplify(theaterId);

  if (result.errors?.length) {
    throw new Error(
      `Unable to load theater from Amplify: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  return result.data ? toAdminTheater(result.data) : null;
}

export async function getAdminScreens() {
  const result = await listScreensFromAmplify();

  if (result.errors?.length) {
    throw new Error(
      `Unable to load screens from Amplify: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  return result.data.map(toAdminScreen);
}

export async function getAdminScreen(screenId: string) {
  const result = await getScreenFromAmplify(screenId);

  if (result.errors?.length) {
    throw new Error(
      `Unable to load screen from Amplify: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  return result.data ? toAdminScreen(result.data) : null;
}

export async function getAdminScreensForTheater(theaterId: string) {
  const result = await listScreensFromAmplify(theaterId);

  if (result.errors?.length) {
    throw new Error(
      `Unable to load theater screens from Amplify: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  return result.data.map(toAdminScreen);
}

export async function getAdminMovies() {
  return adminMovies;
}

export async function getAdminMovie(movieId: string) {
  return adminMovies.find((movie) => movie.id === movieId) ?? null;
}

export async function getAdminMovieDetail(movieId: string) {
  const adminMovie = await getAdminMovie(movieId);
  if (!adminMovie) {
    return null;
  }

  const [movie, showtimes] = await Promise.all([
    getMovieDetail(adminMovie.slug),
    getMovieShowtimes(adminMovie.slug),
  ]);

  return {
    adminMovie,
    movie,
    showtimes,
  };
}

export async function getAdminBookings() {
  return adminBookings;
}

export async function getAdminBooking(bookingId: string) {
  return adminBookings.find((booking) => booking.id === bookingId) ?? null;
}

export async function getAdminEvents() {
  return adminEvents;
}

export async function getAdminEvent(eventId: string) {
  return adminEvents.find((event) => event.id === eventId) ?? null;
}

export async function getAdminRecentActivity() {
  return adminRecentActivity;
}

export async function getImportCandidates() {
  return importCandidates;
}

export async function searchTmdbImportCandidates(query: string) {
  const results = (await searchTmdbMovies(query)).slice(0, 6);

  return Promise.all(
    results.map(async (result) => {
      const [details, credits, trailerYouTubeId] = await Promise.all([
        getTmdbMovieDetails(result.id),
        getTmdbCredits(result.id),
        getTmdbTrailerYouTubeId(result.id),
      ]);

      return {
        id: `tmdb-${result.id}`,
        title: details?.title ?? result.title,
        year: getTmdbSearchResultYear(result) ?? new Date().getUTCFullYear(),
        poster:
          details?.poster ??
          (result.poster_path
            ? `https://image.tmdb.org/t/p/original${result.poster_path}`
            : "/next.svg"),
        backdrop:
          details?.backdrop ??
          (result.backdrop_path
            ? `https://image.tmdb.org/t/p/original${result.backdrop_path}`
            : "/next.svg"),
        overview:
          details?.synopsis ??
          result.overview ??
          "Overview unavailable.",
        genres:
          details?.genre
            ?.split("/")
            .map((genre) => genre.trim())
            .filter(Boolean) ?? ["Genre unavailable"],
        castHighlights:
          credits?.cast?.length ? credits.cast : ["Cast unavailable"],
        trailerLabel: trailerYouTubeId
          ? "Trailer available"
          : "Trailer not available yet",
        trailerYouTubeId,
      };
    })
  );
}
