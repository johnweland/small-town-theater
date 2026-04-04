import {
  listPublicMoviesFromAmplify,
  listPublicTheatersFromAmplify,
} from "@/lib/amplify/public-server";

type PublicMovieRecord = Awaited<
  ReturnType<typeof listPublicMoviesFromAmplify>
>["data"][number];
type PublicTheaterRecord = Awaited<
  ReturnType<typeof listPublicTheatersFromAmplify>
>["data"][number];

export type SitemapMovie = Pick<PublicMovieRecord, "slug" | "updatedAt" | "status">;
export type SitemapTheater = Pick<PublicTheaterRecord, "slug" | "updatedAt" | "status">;

const DEFAULT_BASE_URL = "http://localhost:3000";

export function getBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_BASE_URL;
  return baseUrl.replace(/\/+$/, "");
}

export async function getMovies(): Promise<SitemapMovie[]> {
  try {
    const result = await listPublicMoviesFromAmplify();

    if (result.errors?.length) {
      console.warn("Unable to load sitemap movies:", result.errors);
      return [];
    }

    return result.data
      .filter(
        (movie) =>
          Boolean(movie.slug) &&
          (movie.status === "nowPlaying" || movie.status === "comingSoon")
      )
      .map((movie) => ({
        slug: movie.slug,
        status: movie.status,
        updatedAt: movie.updatedAt,
      }));
  } catch {
    console.warn("Sitemap: failed to fetch movies, returning empty list");
    return [];
  }
}

export async function getTheaters(): Promise<SitemapTheater[]> {
  try {
    const result = await listPublicTheatersFromAmplify();

    if (result.errors?.length) {
      console.warn("Unable to load sitemap theaters:", result.errors);
      return [];
    }

    return result.data
      .filter((theater) => Boolean(theater.slug) && theater.status === "active")
      .map((theater) => ({
        slug: theater.slug,
        status: theater.status,
        updatedAt: theater.updatedAt,
      }));
  } catch {
    console.warn("Sitemap: failed to fetch theaters, returning empty list");
    return [];
  }
}
