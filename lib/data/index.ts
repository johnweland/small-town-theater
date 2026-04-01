/**
 * Data access layer.
 *
 * All functions are async so callers don't need to change when these are
 * replaced with GraphQL queries or REST fetch calls.
 */

import { bookings } from "./bookings";
import { movies } from "./movies";
import { memberships } from "./memberships";
import { screens } from "./screens";
import { theaters } from "./theaters";
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
  TheaterStatus,
  MovieShowtime,
  TheaterWithBookings,
  TheaterWithShowtimes,
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
};

// ── Movies ────────────────────────────────────────────────────────────────────

export async function getMovies(): Promise<Movie[]> {
  return movies;
}

export async function getMovie(slug: string): Promise<Movie | null> {
  return movies.find((m) => m.slug === slug) ?? null;
}

export async function getNowPlayingMovies(): Promise<Movie[]> {
  return movies.filter((m) => m.status === "now-playing");
}

export async function getComingSoonMovies(): Promise<Movie[]> {
  return movies.filter((m) => m.status === "coming-soon");
}

export async function getMovieDetail(slug: string): Promise<Movie | null> {
  const movie = movies.find((m) => m.slug === slug);
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
  const theaterById = Object.fromEntries(theaters.map((theater) => [theater.id, theater]));
  const screenById = Object.fromEntries(screens.map((screen) => [screen.id, screen]));

  return bookings
    .filter((booking) => booking.movieSlug === slug && booking.status === "published")
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
}

// ── Theaters ──────────────────────────────────────────────────────────────────

export async function getTheaters(): Promise<Theater[]> {
  return theaters;
}

export async function getTheater(id: string): Promise<Theater | null> {
  return theaters.find((t) => t.id === id) ?? null;
}

export async function getMembershipPrograms(): Promise<MembershipProgram[]> {
  return memberships;
}

export async function getPrimaryMembershipProgram(): Promise<MembershipProgram | null> {
  return memberships[0] ?? null;
}

export async function getScreens(): Promise<Screen[]> {
  return screens;
}

export async function getScreen(screenId: string): Promise<Screen | null> {
  return screens.find((screen) => screen.id === screenId) ?? null;
}

export async function getScreensForTheater(theaterId: string): Promise<Screen[]> {
  return screens
    .filter((screen) => screen.theaterId === theaterId)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export async function getBookings(): Promise<Booking[]> {
  return bookings;
}

export async function getBooking(bookingId: string): Promise<Booking | null> {
  return bookings.find((booking) => booking.id === bookingId) ?? null;
}

/** Theater with its currently-showing films joined in — for the theater detail page. */
export async function getTheaterWithShowtimes(
  id: string
): Promise<TheaterWithShowtimes | null> {
  const theater = theaters.find((t) => t.id === id);
  if (!theater) return null;

  const movieMap = Object.fromEntries(movies.map((movie) => [movie.slug, movie]));
  const screenMap = Object.fromEntries(screens.map((screen) => [screen.id, screen]));

  const currentBookings = bookings
    .filter((booking) => booking.theaterId === id && booking.status === "published")
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
        times: booking.showtimes.flatMap((showtime) => showtime.times),
        price: booking.ticketPrice,
        isNew: movie.status === "coming-soon",
      };
    })
    .filter((booking): booking is NonNullable<typeof booking> => Boolean(booking));

  return { ...theater, currentBookings };
}

/** All theaters with their bookings joined in — for the showtimes page. */
export async function getTheatersWithBookings(): Promise<TheaterWithBookings[]> {
  const movieMap = Object.fromEntries(movies.map((movie) => [movie.slug, movie]));
  const screenMap = Object.fromEntries(screens.map((screen) => [screen.id, screen]));

  return theaters.map((theater) => {
    const theaterBookings = bookings
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
          times: booking.showtimes.flatMap((showtime) => showtime.times),
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
  return movies.map((m) => m.slug);
}
