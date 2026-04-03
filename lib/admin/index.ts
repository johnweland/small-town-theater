import {
  adminEvents,
  adminRecentActivity,
} from "./mock-data";
import { theaters as siteTheaters } from "@/lib/data/theaters";
import { screens as siteScreens } from "@/lib/data/screens";
import {
  listTheatersFromAmplify,
  getTheaterFromAmplify,
  listScreensFromAmplify,
  getScreenFromAmplify,
  getMovieFromAmplify,
  listMoviesFromAmplify,
  getBookingFromAmplify,
  listBookingsFromAmplify,
  getEventFromAmplify,
  listEventsFromAmplify,
  resolveProtectedStorageUrl,
} from "@/lib/amplify/server";
import {
  getTmdbCredits,
  getTmdbMovieDetails,
  getTmdbSearchResultYear,
  getTmdbTrailerYouTubeId,
  searchTmdbMovies,
} from "@/lib/data/tmdb";
import type { Schema } from "@/amplify/data/resource";

type AdminMovieStatus = "now-playing" | "coming-soon" | "draft" | "archived";

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
type AmplifyMovieRecord = NonNullable<
  Awaited<ReturnType<typeof getMovieFromAmplify>>["data"]
>;
type AmplifyBookingRecord = NonNullable<
  Awaited<ReturnType<typeof getBookingFromAmplify>>["data"]
>;
type AmplifyEventRecord = Schema["Event"]["type"];

function toAdminMovieStatus(
  status: AmplifyMovieRecord["status"]
): AdminMovieStatus {
  switch (status) {
    case "nowPlaying":
      return "now-playing";
    case "comingSoon":
      return "coming-soon";
    case "draft":
      return "draft";
    case "archived":
      return "archived";
  }
}

function getMovieYear(movie: AmplifyMovieRecord) {
  if (!movie.releaseDate) {
    return new Date().getUTCFullYear();
  }

  const parsed = new Date(movie.releaseDate);
  return Number.isNaN(parsed.getTime())
    ? new Date().getUTCFullYear()
    : parsed.getUTCFullYear();
}

function getRuntimeMinutes(runtime?: string | null) {
  if (!runtime) {
    return 0;
  }

  const hoursMatch = runtime.match(/(\d+)\s*h/);
  const minutesMatch = runtime.match(/(\d+)\s*m/);
  const hours = hoursMatch ? Number.parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? Number.parseInt(minutesMatch[1], 10) : 0;
  const total = hours * 60 + minutes;

  return Number.isNaN(total) ? 0 : total;
}

function toAmplifyDate(value?: string) {
  if (!value) {
    return undefined;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function toAdminDateTimeLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function toEventImage(image?: string | null) {
  return image?.trim() || "/next.svg";
}

function toAdminMovie(movie: AmplifyMovieRecord) {
  return {
    id: movie.id,
    slug: movie.slug,
    title: movie.title,
    year: getMovieYear(movie),
    runtimeMinutes: getRuntimeMinutes(movie.runtime),
    rating: movie.rating ?? "NR",
    genres:
      movie.genre
        ?.split("/")
        .map((genre) => genre.trim())
        .filter(Boolean) ?? [],
    status: toAdminMovieStatus(movie.status),
    tagline: movie.tagline ?? "Tagline unavailable.",
    overview: movie.synopsis ?? "Synopsis unavailable.",
    poster: movie.poster ?? "/next.svg",
    backdrop: movie.backdrop ?? "/next.svg",
    castHighlights:
      movie.cast?.filter((credit): credit is string => Boolean(credit)) ?? [],
    trailerLabel: movie.trailerYouTubeId
      ? "Trailer available"
      : "Trailer not available yet",
  };
}

function toAdminMovieDetail(movie: AmplifyMovieRecord) {
  return {
    id: movie.id,
    slug: movie.slug,
    title: movie.title,
    tagline: movie.tagline ?? "Tagline unavailable.",
    rating: movie.rating ?? "NR",
    runtime: movie.runtime ?? "Runtime TBD",
    genre: movie.genre ?? "Genre unavailable",
    status: toAdminMovieStatus(movie.status),
    director: movie.director ?? "Director unavailable",
    cast: movie.cast?.filter((credit): credit is string => Boolean(credit)) ?? [],
    synopsis: movie.synopsis ?? "Synopsis unavailable.",
    production: movie.production ?? "Production unavailable",
    score: movie.score ?? "Score unavailable",
    cinematography: movie.cinematography ?? "Cinematography unavailable",
    backdrop: movie.backdrop ?? "/next.svg",
    poster: movie.poster ?? "/next.svg",
    releaseDate: movie.releaseDate ?? undefined,
    audienceScore: movie.audienceScore ?? undefined,
    originalLanguage: movie.originalLanguage ?? undefined,
    productionCompanies:
      movie.productionCompanies?.filter(
        (company): company is string => Boolean(company)
      ) ?? [],
    tmdbId: movie.tmdbId ?? undefined,
    trailerYouTubeId: movie.trailerYouTubeId ?? undefined,
  };
}

async function toAdminTheater(
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
    heroImagePreview:
      (await resolveProtectedStorageUrl(theater.heroImage)) ??
      fallback?.heroImage ??
      "/next.svg",
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

function toAdminBooking(
  booking: AmplifyBookingRecord,
  movieSlugById: Record<string, string>
) {
  return {
    id: booking.id,
    slug: booking.slug,
    theaterId: booking.theaterId,
    screenId: booking.screenId,
    movieSlug: movieSlugById[booking.movieId] ?? booking.movieId,
    status: booking.status,
    runStartsOn: booking.runStartsOn,
    runEndsOn: booking.runEndsOn,
    ticketPrice: booking.ticketPrice ?? "",
    badge: booking.badge ?? null,
    showtimes:
      booking.showtimes
        ?.filter((showtime): showtime is NonNullable<typeof showtime> => Boolean(showtime))
        .map((showtime) => ({
          day: showtime.day,
          times: showtime.times.filter((time): time is string => Boolean(time)),
        })) ?? [],
    exceptions:
      booking.exceptions
        ?.filter(
          (exception): exception is NonNullable<typeof exception> => Boolean(exception)
        )
        .map((exception) => ({
          date: exception.date,
          label: exception.label,
        })) ?? [],
    note: booking.note ?? "",
  };
}

async function toAdminEvent(event: AmplifyEventRecord) {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    summary: event.summary,
    description: event.description ?? "",
    theaterId: event.theaterId,
    image: toEventImage(event.image),
    imagePreview: toEventImage(await resolveProtectedStorageUrl(event.image)),
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    startsAtLabel: toAdminDateTimeLabel(event.startsAt),
    endsAtLabel: toAdminDateTimeLabel(event.endsAt),
    status: event.status,
  };
}

function isMissingEventModelError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("Events are not available right now")
  );
}

export async function getAdminTheaters() {
  const result = await listTheatersFromAmplify();

  if (result.errors?.length) {
    throw new Error(
      `Unable to load theaters: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  return Promise.all(result.data.map(toAdminTheater));
}

export async function getAdminTheater(theaterId: string) {
  const result = await getTheaterFromAmplify(theaterId);

  if (result.errors?.length) {
    throw new Error(
      `Unable to load theater: ${result.errors
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
      `Unable to load screens: ${result.errors
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
      `Unable to load screen: ${result.errors
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
      `Unable to load theater screens: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  return result.data.map(toAdminScreen);
}

export async function getAdminMovies() {
  const result = await listMoviesFromAmplify();

  if (result.errors?.length) {
    throw new Error(
      `Unable to load movies: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  return result.data.map(toAdminMovie);
}

export async function getAdminMovie(movieId: string) {
  const result = await getMovieFromAmplify(movieId);

  if (result.errors?.length) {
    throw new Error(
      `Unable to load movie: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  return result.data ? toAdminMovie(result.data) : null;
}

export async function getAdminMovieDetail(movieId: string) {
  const result = await getMovieFromAmplify(movieId);

  if (result.errors?.length) {
    throw new Error(
      `Unable to load movie detail: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  const movie = result.data;
  if (!movie) {
    return null;
  }

  const [adminMovie, bookings, theaters, screens] = await Promise.all([
    Promise.resolve(toAdminMovie(movie)),
    getAdminBookings(),
    getAdminTheaters(),
    getAdminScreens(),
  ]);
  const theaterById = Object.fromEntries(theaters.map((theater) => [theater.id, theater]));
  const screenById = Object.fromEntries(screens.map((screen) => [screen.id, screen]));

  const showtimes = bookings
    .filter((booking) => booking.movieSlug === movie.slug && booking.status === "published")
    .map((booking) => ({
      bookingId: booking.id,
      theaterId: booking.theaterId,
      theaterName: theaterById[booking.theaterId]?.name ?? booking.theaterId,
      screenId: booking.screenId,
      screenName: screenById[booking.screenId]?.name ?? booking.screenId,
      runStartsOn: booking.runStartsOn,
      runEndsOn: booking.runEndsOn,
      status: booking.status,
      badge: booking.badge,
      times: booking.showtimes.flatMap((showtime) => showtime.times),
      price: booking.ticketPrice,
    }));

  return {
    adminMovie,
    movie: toAdminMovieDetail(movie),
    showtimes,
  };
}

export async function getAdminBookings() {
  const [bookingsResult, movies] = await Promise.all([
    listBookingsFromAmplify(),
    listMoviesFromAmplify(),
  ]);

  if (bookingsResult.errors?.length) {
    throw new Error(
      `Unable to load bookings: ${bookingsResult.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  if (movies.errors?.length) {
    throw new Error(
      `Unable to load movies for bookings: ${movies.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  const movieSlugById = Object.fromEntries(
    movies.data.map((movie) => [movie.id, movie.slug])
  );

  return bookingsResult.data.map((booking) => toAdminBooking(booking, movieSlugById));
}

export async function getAdminBooking(bookingId: string) {
  const [bookingResult, movies] = await Promise.all([
    getBookingFromAmplify(bookingId),
    listMoviesFromAmplify(),
  ]);

  if (bookingResult.errors?.length) {
    throw new Error(
      `Unable to load booking: ${bookingResult.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  if (movies.errors?.length) {
    throw new Error(
      `Unable to load movies for booking: ${movies.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  if (!bookingResult.data) {
    return null;
  }

  const movieSlugById = Object.fromEntries(
    movies.data.map((movie) => [movie.id, movie.slug])
  );

  return toAdminBooking(bookingResult.data, movieSlugById);
}

export async function getAdminEvents() {
  let result: Awaited<ReturnType<typeof listEventsFromAmplify>>;

  try {
    result = await listEventsFromAmplify();
  } catch (error) {
    if (isMissingEventModelError(error)) {
      return adminEvents;
    }

    throw error;
  }

  if (result.errors?.length) {
    throw new Error(
      `Unable to load events: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  return Promise.all(result.data.map(toAdminEvent));
}

export async function getAdminEvent(eventId: string) {
  let result: Awaited<ReturnType<typeof getEventFromAmplify>>;

  try {
    result = await getEventFromAmplify(eventId);
  } catch (error) {
    if (isMissingEventModelError(error)) {
      return adminEvents.find((event) => event.id === eventId) ?? null;
    }

    throw error;
  }

  if (result.errors?.length) {
    throw new Error(
      `Unable to load event: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  return result.data ? toAdminEvent(result.data) : null;
}

export async function getAdminRecentActivity() {
  return adminRecentActivity;
}

export async function getImportCandidates() {
  return [];
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
        tmdbId: result.id,
        tagline: details?.tagline ?? "Imported from TMDB movie details.",
        rating: "NR",
        runtime: details?.runtime ?? "Runtime TBD",
        status: (result.release_date
          ? Date.parse(result.release_date) > Date.now()
            ? "coming-soon"
            : "now-playing"
          : "now-playing") as AdminMovieStatus,
        director: credits?.director ?? "Director unavailable",
        releaseDate: toAmplifyDate(result.release_date),
        audienceScore: details?.audienceScore ?? `${result.vote_average.toFixed(1)} / 10`,
        originalLanguage: details?.originalLanguage,
        productionCompanies: details?.productionCompanies ?? [],
      };
    })
  );
}
