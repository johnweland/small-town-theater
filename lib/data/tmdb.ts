import type { Movie } from "./types";

export interface TmdbSearchMovieResult {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface TmdbVideoResult {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  official: boolean;
  published_at: string;
  site: string;
  size: number;
  type: string;
}

interface TmdbVideoResponse {
  id: number;
  results: TmdbVideoResult[];
}

interface TmdbCastMember {
  adult: boolean;
  cast_id?: number;
  character: string;
  credit_id: string;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  order: number;
  original_name: string;
  popularity: number;
  profile_path: string | null;
}

interface TmdbCrewMember {
  adult: boolean;
  credit_id: string;
  department: string;
  gender: number;
  id: number;
  job: string;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
}

interface TmdbCreditsResponse {
  id: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

interface TmdbMovieDetailsResponse {
  id: number;
  title: string;
  tagline: string;
  overview: string;
  runtime: number | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  original_language: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string }[];
}

interface TmdbSearchResponse {
  page: number;
  results: TmdbSearchMovieResult[];
  total_pages: number;
  total_results: number;
}

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";
const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toImageUrl(path: string | null) {
  return path ? `${TMDB_IMAGE_BASE_URL}${path}` : "/next.svg";
}

function releaseDateToStatus(releaseDate: string): Movie["status"] {
  if (!releaseDate) {
    return "now-playing";
  }

  const releaseTime = Date.parse(releaseDate);
  if (Number.isNaN(releaseTime)) {
    return "now-playing";
  }

  return releaseTime > Date.now() ? "coming-soon" : "now-playing";
}

function formatRuntime(minutes: number | null) {
  if (!minutes || minutes <= 0) {
    return "Runtime TBD";
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) {
    return `${remainder}m`;
  }

  if (remainder === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainder}m`;
}

function formatReleaseDate(releaseDate: string) {
  if (!releaseDate) {
    return undefined;
  }

  const parsed = new Date(releaseDate);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function toIsoReleaseDate(releaseDate: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(releaseDate) ? releaseDate : undefined;
}

function formatOriginalLanguage(languageCode: string) {
  if (!languageCode) {
    return undefined;
  }

  try {
    return (
      new Intl.DisplayNames(["en"], { type: "language" }).of(languageCode) ??
      languageCode.toUpperCase()
    );
  } catch {
    return languageCode.toUpperCase();
  }
}

function formatYear(releaseDate: string) {
  if (!releaseDate) {
    return undefined;
  }

  const parsed = new Date(releaseDate);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.getUTCFullYear();
}

export function mapTmdbSearchResultToMovie(
  result: TmdbSearchMovieResult,
  overrides: Partial<Movie> = {}
): Movie {
  return {
    tmdbId: overrides.tmdbId ?? result.id,
    slug: overrides.slug ?? slugify(result.title),
    title: overrides.title ?? result.title,
    tagline: overrides.tagline ?? "Imported from TMDB search results.",
    rating: overrides.rating ?? "NR",
    runtime: overrides.runtime ?? "Runtime TBD",
    genre: overrides.genre ?? "Adventure",
    status: overrides.status ?? releaseDateToStatus(result.release_date),
    director: overrides.director ?? "Director unavailable in TMDB search result",
    cast: overrides.cast ?? ["Cast unavailable in TMDB search result"],
    synopsis: overrides.synopsis ?? result.overview,
    production:
      overrides.production ?? "Production unavailable in TMDB search result",
    score: overrides.score ?? `TMDB ${result.vote_average.toFixed(1)}/10`,
    cinematography:
      overrides.cinematography ??
      "Cinematography unavailable in TMDB search result",
    backdrop: overrides.backdrop ?? toImageUrl(result.backdrop_path),
    poster: overrides.poster ?? toImageUrl(result.poster_path),
    releaseDate: overrides.releaseDate ?? formatReleaseDate(result.release_date),
    audienceScore:
      overrides.audienceScore ?? `${result.vote_average.toFixed(1)} / 10`,
    trailerYouTubeId: overrides.trailerYouTubeId,
  };
}

export async function searchTmdbMovies(
  query: string
): Promise<TmdbSearchMovieResult[]> {
  const token = getTmdbReadAccessToken();
  const trimmedQuery = query.trim();

  if (!token || trimmedQuery.length === 0) {
    return [];
  }

  try {
    const search = new URLSearchParams({
      query: trimmedQuery,
      include_adult: "false",
      language: "en-US",
      page: "1",
    });

    const response = await fetch(`${TMDB_API_BASE_URL}/search/movie?${search}`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as TmdbSearchResponse;
    return payload.results;
  } catch {
    return [];
  }
}

export function getTmdbSearchResultYear(result: TmdbSearchMovieResult) {
  return formatYear(result.release_date);
}

function getTmdbReadAccessToken() {
  return process.env.TMDB_BEARER_TOKEN ?? null;
}

function selectTrailer(results: TmdbVideoResult[]) {
  const trailerCandidates = results.filter(
    (result) => result.site === "YouTube" && result.type === "Trailer"
  );

  return (
    trailerCandidates.find((result) => result.official) ??
    trailerCandidates[0] ??
    null
  );
}

export async function getTmdbTrailerYouTubeId(
  movieId: number
): Promise<string | undefined> {
  const token = getTmdbReadAccessToken();
  if (!token) {
    return undefined;
  }

  try {
    const response = await fetch(
      `${TMDB_API_BASE_URL}/movie/${movieId}/videos?language=en-US`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return undefined;
    }

    const payload = (await response.json()) as TmdbVideoResponse;
    return selectTrailer(payload.results)?.key;
  } catch {
    return undefined;
  }
}

export async function getTmdbCredits(
  movieId: number
): Promise<Pick<Movie, "director" | "cast"> | undefined> {
  const token = getTmdbReadAccessToken();
  if (!token) {
    return undefined;
  }

  try {
    const response = await fetch(`${TMDB_API_BASE_URL}/movie/${movieId}/credits`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return undefined;
    }

    const payload = (await response.json()) as TmdbCreditsResponse;
    const director =
      payload.crew.find((member) => member.job === "Director")?.name ?? undefined;
    const cast = payload.cast
      .sort((a, b) => a.order - b.order)
      .slice(0, 5)
      .map((member) => member.name);

    if (!director && cast.length === 0) {
      return undefined;
    }

    return {
      director: director ?? "Director unavailable",
      cast,
    };
  } catch {
    return undefined;
  }
}

export async function getTmdbMovieDetails(
  movieId: number
): Promise<
  | Pick<
      Movie,
      | "title"
      | "tagline"
      | "synopsis"
      | "runtime"
      | "genre"
      | "poster"
      | "backdrop"
      | "releaseDate"
      | "audienceScore"
      | "originalLanguage"
      | "productionCompanies"
    > & { releaseDateIso?: string }
  | undefined
> {
  const token = getTmdbReadAccessToken();
  if (!token) {
    return undefined;
  }

  try {
    const response = await fetch(`${TMDB_API_BASE_URL}/movie/${movieId}`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return undefined;
    }

    const payload = (await response.json()) as TmdbMovieDetailsResponse;

    return {
      title: payload.title,
      tagline: payload.tagline || "Imported from TMDB movie details.",
      synopsis: payload.overview,
      runtime: formatRuntime(payload.runtime),
      genre:
        payload.genres.slice(0, 2).map((genre) => genre.name).join(" / ") ||
        "Genre unavailable",
      poster: toImageUrl(payload.poster_path),
      backdrop: toImageUrl(payload.backdrop_path),
      releaseDate: formatReleaseDate(payload.release_date),
      releaseDateIso: toIsoReleaseDate(payload.release_date),
      audienceScore: `${payload.vote_average.toFixed(1)} / 10`,
      originalLanguage: formatOriginalLanguage(payload.original_language),
      productionCompanies: payload.production_companies.map(
        (company) => company.name
      ),
    };
  } catch {
    return undefined;
  }
}
