import { describe, expect, it, vi } from "vitest";

import {
  getTmdbCredits,
  getTmdbMovieDetails,
  getTmdbSearchResultYear,
  getTmdbTrailerYouTubeId,
  mapTmdbSearchResultToMovie,
  searchTmdbMovies,
  type TmdbSearchMovieResult,
} from "@/lib/data/tmdb";

const searchResult: TmdbSearchMovieResult = {
  adult: false,
  backdrop_path: "/9Z2uDYXqJrlmePznQQJhL6d92Rq.jpg",
  genre_ids: [10751, 14, 35, 12, 16],
  id: 1226863,
  original_language: "en",
  original_title: "The Super Mario Galaxy Movie",
  overview:
    "Having thwarted Bowser's previous plot to marry Princess Peach, Mario and Luigi now face a fresh threat in Bowser Jr.",
  popularity: 63.2296,
  poster_path: "/eJGWx219ZcEMVQJhAgMiqo8tYY.jpg",
  release_date: "2026-04-01",
  title: "The Super Mario Galaxy Movie",
  video: false,
  vote_average: 8.1,
  vote_count: 10,
};

describe("mapTmdbSearchResultToMovie", () => {
  it("maps TMDB image paths and search metadata into the local movie shape", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-31T12:00:00Z"));

    const movie = mapTmdbSearchResultToMovie(searchResult);

    expect(movie.slug).toBe("the-super-mario-galaxy-movie");
    expect(movie.tmdbId).toBe(1226863);
    expect(movie.title).toBe("The Super Mario Galaxy Movie");
    expect(movie.status).toBe("coming-soon");
    expect(movie.synopsis).toContain("Bowser Jr.");
    expect(movie.poster).toBe(
      "https://image.tmdb.org/t/p/original/eJGWx219ZcEMVQJhAgMiqo8tYY.jpg"
    );
    expect(movie.backdrop).toBe(
      "https://image.tmdb.org/t/p/original/9Z2uDYXqJrlmePznQQJhL6d92Rq.jpg"
    );

    vi.useRealTimers();
  });

  it("returns the first official YouTube trailer from TMDB videos", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 1226863,
        results: [
          {
            id: "teaser-1",
            iso_639_1: "en",
            iso_3166_1: "US",
            key: "teaser-key",
            name: "Teaser",
            official: false,
            published_at: "2026-01-01T00:00:00.000Z",
            site: "YouTube",
            size: 1080,
            type: "Teaser",
          },
          {
            id: "trailer-1",
            iso_639_1: "en",
            iso_3166_1: "US",
            key: "official-trailer-key",
            name: "Official Trailer",
            official: true,
            published_at: "2026-02-01T00:00:00.000Z",
            site: "YouTube",
            size: 1080,
            type: "Trailer",
          },
        ],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("TMDB_API_READ_ACCESS_TOKEN", "test-token");

    await expect(getTmdbTrailerYouTubeId(1226863)).resolves.toBe(
      "official-trailer-key"
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.themoviedb.org/3/movie/1226863/videos?language=en-US",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
          accept: "application/json",
        }),
      })
    );
  });

  it("returns the director and top billed cast from TMDB credits", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 1226863,
        cast: [
          { id: 1, name: "Chris Pratt", order: 0 },
          { id: 2, name: "Charlie Day", order: 1 },
          { id: 3, name: "Anya Taylor-Joy", order: 2 },
          { id: 4, name: "Jack Black", order: 3 },
          { id: 5, name: "Keegan-Michael Key", order: 4 },
          { id: 6, name: "Seth Rogen", order: 5 },
        ],
        crew: [
          { id: 10, name: "Aaron Horvath", job: "Director" },
          { id: 11, name: "Michael Jelenic", job: "Writer" },
        ],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("TMDB_API_READ_ACCESS_TOKEN", "test-token");

    await expect(getTmdbCredits(1226863)).resolves.toEqual({
      director: "Aaron Horvath",
      cast: [
        "Chris Pratt",
        "Charlie Day",
        "Anya Taylor-Joy",
        "Jack Black",
        "Keegan-Michael Key",
      ],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.themoviedb.org/3/movie/1226863/credits",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
          accept: "application/json",
        }),
      })
    );
  });

  it("returns formatted movie details from TMDB", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 1226863,
        title: "The Super Mario Galaxy Movie",
        tagline: "Adventure awaits among the stars.",
        overview: "Mario and Luigi race across the galaxy.",
        runtime: 108,
        release_date: "2026-04-01",
        vote_average: 8.1,
        vote_count: 10,
        original_language: "en",
        poster_path: "/poster.jpg",
        backdrop_path: "/backdrop.jpg",
        genres: [
          { id: 10751, name: "Family" },
          { id: 12, name: "Adventure" },
        ],
        production_companies: [
          { id: 1, name: "Nintendo Pictures" },
          { id: 2, name: "Illumination" },
        ],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("TMDB_API_READ_ACCESS_TOKEN", "test-token");

    await expect(getTmdbMovieDetails(1226863)).resolves.toEqual({
      title: "The Super Mario Galaxy Movie",
      tagline: "Adventure awaits among the stars.",
      synopsis: "Mario and Luigi race across the galaxy.",
      runtime: "1h 48m",
      genre: "Family / Adventure",
      poster: "https://image.tmdb.org/t/p/original/poster.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/backdrop.jpg",
      releaseDate: "Apr 1, 2026",
      audienceScore: "8.1 / 10",
      originalLanguage: "English",
      productionCompanies: ["Nintendo Pictures", "Illumination"],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.themoviedb.org/3/movie/1226863",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
          accept: "application/json",
        }),
      })
    );
  });

  it("searches TMDB movies from a free-text query", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        page: 1,
        results: [searchResult],
        total_pages: 1,
        total_results: 1,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("TMDB_API_READ_ACCESS_TOKEN", "test-token");

    await expect(searchTmdbMovies("mario")).resolves.toEqual([searchResult]);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.themoviedb.org/3/search/movie?query=mario&include_adult=false&language=en-US&page=1",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
          accept: "application/json",
        }),
        cache: "no-store",
      })
    );
  });

  it("derives a release year from a search result", () => {
    expect(getTmdbSearchResultYear(searchResult)).toBe(2026);
  });
});
