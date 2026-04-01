import type { Movie } from "./types";
import { tmdbMovieFixtures, type TmdbFixtureKey } from "./tmdb-fixtures";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

const movieConfigs: Record<
  TmdbFixtureKey,
  { slug: string; rating: string; status: Movie["status"] }
> = {
  superMarioBros: {
    slug: "the-super-mario-bros-movie",
    rating: "PG",
    status: "now-playing",
  },
  superMarioGalaxy: {
    slug: "the-super-mario-galaxy-movie",
    rating: "PG",
    status: "now-playing",
  },
  theMartian: {
    slug: "the-martian",
    rating: "PG-13",
    status: "now-playing",
  },
  projectHailMary: {
    slug: "project-hail-mary",
    rating: "PG-13",
    status: "now-playing",
  },
  hackers: {
    slug: "hackers",
    rating: "PG-13",
    status: "now-playing",
  },
  predatorBadlands: {
    slug: "predator-badlands",
    rating: "R",
    status: "now-playing",
  },
};

function toImageUrl(path: string | null | undefined) {
  return path ? `${TMDB_IMAGE_BASE_URL}${path}` : "/next.svg";
}

function formatRuntime(minutes: number) {
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
  const parsed = new Date(releaseDate);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function formatLanguage(languageCode: string) {
  return (
    new Intl.DisplayNames(["en"], { type: "language" }).of(languageCode) ??
    languageCode.toUpperCase()
  );
}

function toMovie(key: TmdbFixtureKey): Movie {
  const fixture = tmdbMovieFixtures[key];
  const config = movieConfigs[key];
  const directors = fixture.credits.crew
    .filter((member) => member.job === "Director")
    .map((member) => member.name);
  const trailer =
    fixture.videos.find((video) => video.type === "Trailer") ??
    fixture.videos.find((video) => video.type === "Teaser") ??
    fixture.videos[0];

  return {
    tmdbId: fixture.details.id,
    slug: config.slug,
    title: fixture.details.title,
    tagline: fixture.details.tagline,
    rating: config.rating,
    runtime: formatRuntime(fixture.details.runtime),
    genre: fixture.details.genres.slice(0, 2).map((genre) => genre.name).join(" / "),
    status: config.status,
    director: directors.join(" & ") || "Director unavailable",
    cast: fixture.credits.cast.slice(0, 5).map((member) => member.name),
    synopsis: fixture.details.overview,
    production:
      fixture.details.production_companies[0]?.name ?? "Production unavailable",
    score: `TMDB ${fixture.details.vote_average.toFixed(1)}/10`,
    cinematography: "Cinematography unavailable in TMDB fixture data",
    backdrop: toImageUrl(fixture.details.backdrop_path),
    poster: toImageUrl(fixture.details.poster_path),
    releaseDate: formatReleaseDate(fixture.details.release_date),
    audienceScore: `${fixture.details.vote_average.toFixed(1)} / 10`,
    originalLanguage: formatLanguage(fixture.details.original_language),
    productionCompanies: fixture.details.production_companies.map(
      (company) => company.name
    ),
    trailerYouTubeId: trailer?.key,
  };
}

export const movies: Movie[] = (
  Object.keys(tmdbMovieFixtures) as TmdbFixtureKey[]
).map(toMovie);
