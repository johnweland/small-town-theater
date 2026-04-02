/**
 * Data access layer.
 *
 * All functions are async so callers don't need to change when these are
 * replaced with GraphQL queries or REST fetch calls.
 */

import { movies } from "./movies";
import { memberships } from "./memberships";
import { theaters } from "./theaters";
import {
  listPublicBookingsFromAmplify,
  listPublicMoviesFromAmplify,
  listPublicScreensFromAmplify,
  listPublicTheatersFromAmplify,
} from "@/lib/amplify/public-server";
import {
  getTmdbCredits,
  getTmdbMovieDetails,
  getTmdbTrailerYouTubeId,
} from "./tmdb";
import type {
  Booking,
  BookingDay,
  BookingException,
  BookingStatus,
  BookingShowtime,
  Movie,
  MembershipProgram,
  Screen,
  ScreenStatus,
  Theater,
  TheaterSpec,
  TheaterStatus,
  MovieShowtime,
  TheaterWithBookings,
  TheaterWithShowtimes,
  BookingTimeSlot,
} from "./types";

export type {
  Booking,
  BookingDay,
  BookingException,
  BookingStatus,
  BookingShowtime,
  Movie,
  MembershipProgram,
  Screen,
  ScreenStatus,
  Theater,
  TheaterStatus,
  MovieShowtime,
  TheaterWithBookings,
  TheaterWithShowtimes,
  BookingTimeSlot,
};

type PublicAmplifyTheater = Awaited<
  ReturnType<typeof listPublicTheatersFromAmplify>
>["data"][number];
type PublicAmplifyScreen = Awaited<
  ReturnType<typeof listPublicScreensFromAmplify>
>["data"][number];
type PublicAmplifyMovie = Awaited<
  ReturnType<typeof listPublicMoviesFromAmplify>
>["data"][number];
type PublicAmplifyBooking = Awaited<
  ReturnType<typeof listPublicBookingsFromAmplify>
>["data"][number];

function buildTheaterSpecs(
  theater: PublicAmplifyTheater,
  associatedScreens: PublicAmplifyScreen[]
): TheaterSpec[] {
  const sortedScreens = associatedScreens
    .sort((left, right) => left.sortOrder - right.sortOrder);

  const featuredScreens = sortedScreens.filter((screen) => screen.status === "active");
  const screensForSummary = featuredScreens.length ? featuredScreens : sortedScreens;
  const leadScreen = screensForSummary[0] ?? null;
  const screenCount = sortedScreens.length;
  const totalSeats = sortedScreens.reduce(
    (seatTotal, screen) => seatTotal + screen.capacity,
    0
  );
  const projectionSummary = Array.from(
    new Set(screensForSummary.map((screen) => screen.projection))
  )
    .slice(0, 2)
    .join(" / ");
  const featureSummary = leadScreen
    ? leadScreen.features.slice(0, 2).join(" · ")
    : "Feature details coming soon";

  return [
    {
      label: "Screens",
      value:
        screenCount > 0
          ? `${screenCount} ${screenCount === 1 ? "Screen" : "Screens"}${projectionSummary ? ` · ${projectionSummary}` : ""}`
          : "Screen details coming soon",
    },
    {
      label: "Seating",
      value:
        totalSeats > 0
          ? `${totalSeats} Seats Total${leadScreen ? ` · ${leadScreen.name}` : ""}`
          : "Capacity details coming soon",
    },
    {
      label: "Sound",
      value: leadScreen
        ? `${leadScreen.soundFormat}${screenCount > 1 ? ` · ${leadScreen.name}` : ""}`
        : "Audio details coming soon",
    },
    {
      label: "Features",
      value: featureSummary,
    },
    {
      label: "Phone",
      value: theater.phone ?? "Contact details coming soon",
    },
  ];
}

async function toSiteTheater(theater: PublicAmplifyTheater): Promise<Theater> {
  const fallback = theaters.find(
    (siteTheater) =>
      siteTheater.slug === theater.slug || siteTheater.name === theater.name
  );
  const screensResult = await listPublicScreensFromAmplify(theater.id);
  const associatedScreens = screensResult.errors?.length ? [] : screensResult.data;

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
    notes: fallback?.notes ?? "",
    heroImage: theater.heroImage ?? fallback?.heroImage ?? "/next.svg",
    descriptionParagraphs: (
      theater.descriptionParagraphs ?? fallback?.descriptionParagraphs ?? []
    ).filter((paragraph): paragraph is string => Boolean(paragraph)),
    specs: buildTheaterSpecs(theater, associatedScreens),
    concessions: fallback?.concessions ?? [],
  };
}

async function getPublicTheatersFromAmplify(): Promise<Theater[]> {
  const result = await listPublicTheatersFromAmplify();

  if (result.errors?.length) {
    throw new Error(
      `Unable to load public theaters from Amplify: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  return Promise.all(result.data.map(toSiteTheater));
}

async function getPublicTheaterByRouteKey(routeKey: string): Promise<Theater | null> {
  const publicTheaters = await getPublicTheatersFromAmplify();

  return (
    publicTheaters.find(
      (theater) =>
        theater.id === routeKey || theater.slug === routeKey || theater.name === routeKey
    ) ?? null
  );
}

function toMovieStatus(
  status: PublicAmplifyMovie["status"]
): Movie["status"] | "draft" | "archived" {
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

function toSiteMovie(movie: PublicAmplifyMovie): Movie {
  const fallback = movies.find(
    (siteMovie) => siteMovie.slug === movie.slug || siteMovie.tmdbId === movie.tmdbId
  );
  const mappedStatus = toMovieStatus(movie.status);

  return {
    slug: movie.slug,
    title: movie.title,
    tagline: movie.tagline ?? fallback?.tagline ?? "Tagline unavailable.",
    rating: movie.rating ?? fallback?.rating ?? "NR",
    runtime: movie.runtime ?? fallback?.runtime ?? "Runtime TBD",
    genre: movie.genre ?? fallback?.genre ?? "Genre unavailable",
    status:
      mappedStatus === "draft" || mappedStatus === "archived"
        ? fallback?.status ?? "coming-soon"
        : mappedStatus,
    director: movie.director ?? fallback?.director ?? "Director unavailable",
    cast:
      movie.cast?.filter((credit): credit is string => Boolean(credit)) ??
      fallback?.cast ??
      [],
    synopsis: movie.synopsis ?? fallback?.synopsis ?? "Synopsis unavailable.",
    production: movie.production ?? fallback?.production ?? "Production unavailable",
    score: movie.score ?? fallback?.score ?? "Score unavailable",
    cinematography:
      movie.cinematography ??
      fallback?.cinematography ??
      "Cinematography unavailable",
    backdrop: movie.backdrop ?? fallback?.backdrop ?? "/next.svg",
    poster: movie.poster ?? fallback?.poster ?? "/next.svg",
    releaseDate: movie.releaseDate ?? fallback?.releaseDate,
    audienceScore: movie.audienceScore ?? fallback?.audienceScore,
    originalLanguage: movie.originalLanguage ?? fallback?.originalLanguage,
    productionCompanies:
      movie.productionCompanies?.filter(
        (company): company is string => Boolean(company)
      ) ?? fallback?.productionCompanies,
    tmdbId: movie.tmdbId ?? fallback?.tmdbId,
    trailerYouTubeId: movie.trailerYouTubeId ?? fallback?.trailerYouTubeId,
  };
}

async function getPublicMoviesFromAmplify(): Promise<Movie[]> {
  const result = await listPublicMoviesFromAmplify();

  if (result.errors?.length) {
    throw new Error(
      `Unable to load public movies from Amplify: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  return result.data.map(toSiteMovie);
}

function toSiteBooking(booking: PublicAmplifyBooking, movieSlug: string): Booking {
  return {
    id: booking.id,
    slug: booking.slug,
    theaterId: booking.theaterId,
    screenId: booking.screenId,
    movieSlug,
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
    note: "",
  };
}

async function getPublicBookingsFromAmplify(): Promise<Booking[]> {
  const [bookingsResult, moviesResult] = await Promise.all([
    listPublicBookingsFromAmplify(),
    listPublicMoviesFromAmplify(),
  ]);

  if (bookingsResult.errors?.length) {
    throw new Error(
      `Unable to load public bookings from Amplify: ${bookingsResult.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  if (moviesResult.errors?.length) {
    throw new Error(
      `Unable to load public movies for bookings from Amplify: ${moviesResult.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  const movieSlugById = Object.fromEntries(
    moviesResult.data.map((movie) => [movie.id, movie.slug])
  );

  return bookingsResult.data.flatMap((booking) => {
    const movieSlug = movieSlugById[booking.movieId];
    if (!movieSlug) {
      return [];
    }

    return [toSiteBooking(booking, movieSlug)];
  });
}

function toDayShort(day: BookingDay): string {
  return day.slice(0, 3);
}

function flattenBookingTimes(showtimes: BookingShowtime[]): BookingTimeSlot[] {
  return showtimes.flatMap((showtime) =>
    showtime.times.map((time) => ({
      day: showtime.day,
      dayShort: toDayShort(showtime.day),
      time,
    }))
  );
}

// ── Movies ────────────────────────────────────────────────────────────────────

export async function getMovies(): Promise<Movie[]> {
  return getPublicMoviesFromAmplify();
}

export async function getMovie(slug: string): Promise<Movie | null> {
  const publicMovies = await getPublicMoviesFromAmplify();
  return publicMovies.find((movie) => movie.slug === slug) ?? null;
}

export async function getNowPlayingMovies(): Promise<Movie[]> {
  const publicMovies = await getPublicMoviesFromAmplify();
  return publicMovies.filter((movie) => movie.status === "now-playing");
}

export async function getComingSoonMovies(): Promise<Movie[]> {
  const publicMovies = await getPublicMoviesFromAmplify();
  return publicMovies.filter((movie) => movie.status === "coming-soon");
}

export async function getMovieDetail(slug: string): Promise<Movie | null> {
  const publicMovies = await getPublicMoviesFromAmplify();
  const movie = publicMovies.find((item) => item.slug === slug);
  if (!movie) return null;

  const [trailerYouTubeId, credits, details] = movie.tmdbId
    ? await Promise.all([
        movie.trailerYouTubeId
          ? Promise.resolve(movie.trailerYouTubeId)
          : getTmdbTrailerYouTubeId(movie.tmdbId),
        getTmdbCredits(movie.tmdbId),
        getTmdbMovieDetails(movie.tmdbId),
      ])
    : [movie.trailerYouTubeId, undefined, undefined];

  return {
    ...movie,
    title: details?.title ?? movie.title,
    tagline: details?.tagline ?? movie.tagline,
    runtime: details?.runtime ?? movie.runtime,
    genre: details?.genre ?? movie.genre,
    director: credits?.director ?? movie.director,
    cast: credits?.cast?.length ? credits.cast : movie.cast,
    synopsis: details?.synopsis ?? movie.synopsis,
    poster: details?.poster ?? movie.poster,
    backdrop: details?.backdrop ?? movie.backdrop,
    releaseDate: details?.releaseDate ?? movie.releaseDate,
    audienceScore: details?.audienceScore ?? movie.audienceScore ?? movie.score,
    originalLanguage:
      details?.originalLanguage ?? movie.originalLanguage ?? "English",
    productionCompanies:
      details?.productionCompanies ??
      movie.productionCompanies ??
      [movie.production],
    trailerYouTubeId,
  };
}

export async function getMovieShowtimes(slug: string): Promise<MovieShowtime[]> {
  const [publicTheaters, publicBookings, publicScreens] = await Promise.all([
    getPublicTheatersFromAmplify(),
    getPublicBookingsFromAmplify(),
    getScreens(),
  ]);
  const theaterById = Object.fromEntries(
    publicTheaters.map((theater) => [theater.id, theater])
  );
  const screenById = Object.fromEntries(publicScreens.map((screen) => [screen.id, screen]));

  return publicBookings
    .filter((booking) => booking.movieSlug === slug && booking.status === "published")
    .map((booking) => ({
      bookingId: booking.id,
      theaterId: booking.theaterId,
      theaterSlug: theaterById[booking.theaterId]?.slug ?? booking.theaterId,
      theaterName: theaterById[booking.theaterId]?.name ?? booking.theaterId,
      screenId: booking.screenId,
      screenName: screenById[booking.screenId]?.name ?? booking.screenId,
      runStartsOn: booking.runStartsOn,
      runEndsOn: booking.runEndsOn,
      status: booking.status,
      badge: booking.badge,
      times: flattenBookingTimes(booking.showtimes),
      price: booking.ticketPrice,
    }));
}

// ── Theaters ──────────────────────────────────────────────────────────────────

export async function getTheaters(): Promise<Theater[]> {
  return getPublicTheatersFromAmplify();
}

export async function getTheater(id: string): Promise<Theater | null> {
  return getPublicTheaterByRouteKey(id);
}

export async function getMembershipPrograms(): Promise<MembershipProgram[]> {
  return memberships;
}

export async function getPrimaryMembershipProgram(): Promise<MembershipProgram | null> {
  return memberships[0] ?? null;
}

export async function getScreens(): Promise<Screen[]> {
  const publicTheaters = await getPublicTheatersFromAmplify();
  const screenCollections = await Promise.all(
    publicTheaters.map((theater) => listPublicScreensFromAmplify(theater.id))
  );

  const screensWithErrors = screenCollections.find((result) => result.errors?.length);
  if (screensWithErrors?.errors?.length) {
    throw new Error(
      `Unable to load public screens from Amplify: ${screensWithErrors.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  return screenCollections
    .flatMap((result) => result.data)
    .map((screen) => ({
      id: screen.id,
      theaterId: screen.theaterId,
      name: screen.name,
      slug: screen.slug,
      capacity: screen.capacity,
      sortOrder: screen.sortOrder,
      projection: screen.projection,
      soundFormat: screen.soundFormat,
      features: screen.features.filter((feature): feature is string => Boolean(feature)),
      status: screen.status,
    }))
    .sort((left, right) =>
      left.theaterId === right.theaterId
        ? left.sortOrder - right.sortOrder
        : left.theaterId.localeCompare(right.theaterId)
    );
}

export async function getScreen(screenId: string): Promise<Screen | null> {
  const publicScreens = await getScreens();
  return publicScreens.find((screen) => screen.id === screenId) ?? null;
}

export async function getScreensForTheater(theaterId: string): Promise<Screen[]> {
  const publicScreens = await getScreens();
  return publicScreens
    .filter((screen) => screen.theaterId === theaterId)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export async function getBookings(): Promise<Booking[]> {
  return getPublicBookingsFromAmplify();
}

export async function getBooking(bookingId: string): Promise<Booking | null> {
  const publicBookings = await getPublicBookingsFromAmplify();
  return publicBookings.find((booking) => booking.id === bookingId) ?? null;
}

/** Theater with its currently-showing films joined in — for the theater detail page. */
export async function getTheaterWithShowtimes(
  id: string
): Promise<TheaterWithShowtimes | null> {
  const theater = await getPublicTheaterByRouteKey(id);
  if (!theater) return null;

  const [publicMovies, publicScreens, publicBookings] = await Promise.all([
    getPublicMoviesFromAmplify(),
    getScreens(),
    getPublicBookingsFromAmplify(),
  ]);
  const movieMap = Object.fromEntries(publicMovies.map((movie) => [movie.slug, movie]));
  const screenMap = Object.fromEntries(publicScreens.map((screen) => [screen.id, screen]));

  const currentBookings = publicBookings
    .filter(
      (booking) => booking.theaterId === theater.id && booking.status === "published"
    )
    .map((booking) => {
      const movie = movieMap[booking.movieSlug];
      const screen = screenMap[booking.screenId];
      if (!movie) return null;

      return {
        bookingId: booking.id,
        slug: movie.slug,
        screenName: screen?.name ?? booking.screenId,
        runStartsOn: booking.runStartsOn,
        runEndsOn: booking.runEndsOn,
        title: movie.title,
        rating: movie.rating,
        runtime: movie.runtime,
        synopsis: movie.synopsis,
        poster: movie.poster,
        badge: booking.badge,
        times: flattenBookingTimes(booking.showtimes),
        price: booking.ticketPrice,
        isNew: movie.status === "coming-soon",
      };
    })
    .filter((booking): booking is NonNullable<typeof booking> => Boolean(booking));

  return { ...theater, currentBookings };
}

export async function getTheaterSlugs(): Promise<string[]> {
  const publicTheaters = await getPublicTheatersFromAmplify();

  return publicTheaters.map((theater) => theater.slug);
}

/** All theaters with their bookings joined in — for the showtimes page. */
export async function getTheatersWithBookings(): Promise<TheaterWithBookings[]> {
  const [publicTheaters, publicMovies, publicScreens, publicBookings] =
    await Promise.all([
      getPublicTheatersFromAmplify(),
      getPublicMoviesFromAmplify(),
      getScreens(),
      getPublicBookingsFromAmplify(),
    ]);
  const movieMap = Object.fromEntries(publicMovies.map((movie) => [movie.slug, movie]));
  const screenMap = Object.fromEntries(publicScreens.map((screen) => [screen.id, screen]));

  return publicTheaters.map((theater) => {
    const theaterBookings = publicBookings
      .filter(
        (booking) =>
          booking.theaterId === theater.id && booking.status === "published"
      )
      .map((booking) => {
        const movie = movieMap[booking.movieSlug];
        const screen = screenMap[booking.screenId];
        if (!movie) return null;

        return {
          bookingId: booking.id,
          slug: movie.slug,
          screenName: screen?.name ?? booking.screenId,
          runStartsOn: booking.runStartsOn,
          runEndsOn: booking.runEndsOn,
          title: movie.title,
          rating: movie.rating,
          runtime: movie.runtime,
          synopsis: movie.synopsis,
          poster: movie.poster,
          badge: booking.badge,
          times: flattenBookingTimes(booking.showtimes),
          price: booking.ticketPrice,
        };
      })
      .filter((booking): booking is NonNullable<typeof booking> => Boolean(booking));

    return {
      id: theater.id,
      name: theater.name,
      district: theater.district,
      bookings: theaterBookings,
    };
  });
}

/** slugs for generateStaticParams */
export async function getMovieSlugs(): Promise<string[]> {
  const publicMovies = await getPublicMoviesFromAmplify();
  return publicMovies.map((movie) => movie.slug);
}
