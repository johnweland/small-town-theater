/**
 * Data access layer.
 *
 * All functions are async so callers don't need to change when these are
 * replaced with GraphQL queries or REST fetch calls.
 */

import { movies } from "./movies";
import { theaters } from "./theaters";
import { showtimes } from "./showtimes";
import type {
  Movie,
  Theater,
  Showtime,
  MovieWithShowtimes,
  TheaterWithFilms,
  TheaterWithShowtimes,
} from "./types";

export type { Movie, Theater, Showtime, MovieWithShowtimes, TheaterWithFilms, TheaterWithShowtimes };

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

/** Movie with its showtimes joined in — for the movie detail page. */
export async function getMovieWithShowtimes(
  slug: string
): Promise<MovieWithShowtimes | null> {
  const movie = movies.find((m) => m.slug === slug);
  if (!movie) return null;

  const movieShowtimes = showtimes.filter((s) => s.movieSlug === slug);
  const theater = theaters.reduce<Record<string, Theater>>(
    (acc, t) => ({ ...acc, [t.id]: t }),
    {}
  );

  return {
    ...movie,
    showtimes: movieShowtimes.map((s) => ({
      theaterId: s.theaterId,
      theaterName: theater[s.theaterId]?.name ?? s.theaterId,
      badge: s.badge,
      times: s.times,
      price: s.price,
    })),
  };
}

// ── Theaters ──────────────────────────────────────────────────────────────────

export async function getTheaters(): Promise<Theater[]> {
  return theaters;
}

export async function getTheater(id: string): Promise<Theater | null> {
  return theaters.find((t) => t.id === id) ?? null;
}

/** Theater with its currently-showing films joined in — for the theater detail page. */
export async function getTheaterWithShowtimes(
  id: string
): Promise<TheaterWithShowtimes | null> {
  const theater = theaters.find((t) => t.id === id);
  if (!theater) return null;

  const theaterShowtimes = showtimes.filter((s) => s.theaterId === id);
  const movieMap = movies.reduce<Record<string, Movie>>(
    (acc, m) => ({ ...acc, [m.slug]: m }),
    {}
  );

  const nowPlayingSlugs = new Set(
    movies.filter((m) => m.status === "now-playing").map((m) => m.slug)
  );

  const currentFilms = theaterShowtimes
    .filter((s) => nowPlayingSlugs.has(s.movieSlug))
    .map((s) => {
      const movie = movieMap[s.movieSlug];
      return {
        slug: movie.slug,
        title: movie.title,
        rating: movie.rating,
        runtime: movie.runtime,
        synopsis: movie.synopsis,
        poster: movie.poster,
        badge: s.badge,
        times: s.times,
        price: s.price,
        isNew: true,
      };
    });

  return { ...theater, currentFilms };
}

// ── Showtimes ─────────────────────────────────────────────────────────────────

export async function getShowtimes(): Promise<Showtime[]> {
  return showtimes;
}

/** All theaters with their now-playing films joined in — for the showtimes page. */
export async function getTheatersWithFilms(): Promise<TheaterWithFilms[]> {
  const movieMap = movies.reduce<Record<string, Movie>>(
    (acc, m) => ({ ...acc, [m.slug]: m }),
    {}
  );
  const nowPlayingSlugs = new Set(
    movies.filter((m) => m.status === "now-playing").map((m) => m.slug)
  );

  return theaters.map((theater) => {
    const films = showtimes
      .filter(
        (s) => s.theaterId === theater.id && nowPlayingSlugs.has(s.movieSlug)
      )
      .map((s) => {
        const movie = movieMap[s.movieSlug];
        return {
          slug: movie.slug,
          title: movie.title,
          rating: movie.rating,
          runtime: movie.runtime,
          synopsis: movie.synopsis,
          poster: movie.poster,
          badge: s.badge,
          times: s.times,
          price: s.price,
        };
      });

    return { id: theater.id, name: theater.name, district: theater.district, films };
  });
}

/** slugs for generateStaticParams */
export async function getMovieSlugs(): Promise<string[]> {
  return movies.map((m) => m.slug);
}
