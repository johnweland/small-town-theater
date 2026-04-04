import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

function createResponse(payload: unknown, ok = true) {
  return {
    ok,
    json: async () => payload,
  };
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.useRealTimers();
});

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

  });

  it("falls back for missing images and invalid release dates", () => {
    const movie = mapTmdbSearchResultToMovie({
      ...searchResult,
      backdrop_path: null,
      poster_path: null,
      release_date: "not-a-date",
      title: "  WALL-E & Friends!  ",
    });

    expect(movie.slug).toBe("wall-e-friends");
    expect(movie.status).toBe("now-playing");
    expect(movie.poster).toBe("/next.svg");
    expect(movie.backdrop).toBe("/next.svg");
    expect(movie.releaseDate).toBeUndefined();
  });

  it("treats a missing release date as now playing with no formatted date", () => {
    const movie = mapTmdbSearchResultToMovie({
      ...searchResult,
      release_date: "",
    });

    expect(movie.status).toBe("now-playing");
    expect(movie.releaseDate).toBeUndefined();
  });

  it("treats a valid past release date as now playing", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-02T00:00:00Z"));

    const movie = mapTmdbSearchResultToMovie({
      ...searchResult,
      release_date: "2026-04-01",
    });

    expect(movie.status).toBe("now-playing");
  });

  it("uses provided overrides instead of derived TMDB defaults", () => {
    const movie = mapTmdbSearchResultToMovie(searchResult, {
      slug: "custom-slug",
      status: "now-playing",
      runtime: "2h 1m",
      genre: "Animation",
      director: "Custom Director",
      cast: ["Custom Cast"],
      trailerYouTubeId: "abc123",
    });

    expect(movie.slug).toBe("custom-slug");
    expect(movie.status).toBe("now-playing");
    expect(movie.runtime).toBe("2h 1m");
    expect(movie.genre).toBe("Animation");
    expect(movie.director).toBe("Custom Director");
    expect(movie.cast).toEqual(["Custom Cast"]);
    expect(movie.trailerYouTubeId).toBe("abc123");
  });

  it("returns the first official YouTube trailer from TMDB videos", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
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
      })
    );

    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("TMDB_BEARER_TOKEN", "test-token");

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

  it("falls back to the first YouTube trailer when no official trailer exists", async () => {
    vi.stubEnv("TMDB_BEARER_TOKEN", "fallback-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        createResponse({
          id: 1226863,
          results: [
            {
              id: "teaser-1",
              iso_639_1: "en",
              iso_3166_1: "US",
              key: "ignored-teaser",
              name: "Teaser",
              official: true,
              published_at: "2026-01-01T00:00:00.000Z",
              site: "YouTube",
              size: 1080,
              type: "Teaser",
            },
            {
              id: "vimeo-trailer",
              iso_639_1: "en",
              iso_3166_1: "US",
              key: "ignored-vimeo",
              name: "Trailer",
              official: true,
              published_at: "2026-01-02T00:00:00.000Z",
              site: "Vimeo",
              size: 1080,
              type: "Trailer",
            },
            {
              id: "trailer-1",
              iso_639_1: "en",
              iso_3166_1: "US",
              key: "fallback-trailer",
              name: "Trailer 1",
              official: false,
              published_at: "2026-01-03T00:00:00.000Z",
              site: "YouTube",
              size: 1080,
              type: "Trailer",
            },
          ],
        })
      )
    );

    await expect(getTmdbTrailerYouTubeId(1226863)).resolves.toBe("fallback-trailer");
  });

  it("returns undefined when TMDB has no matching YouTube trailers", async () => {
    vi.stubEnv("TMDB_BEARER_TOKEN", "test-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        createResponse({
          id: 1226863,
          results: [
            {
              id: "teaser-1",
              iso_639_1: "en",
              iso_3166_1: "US",
              key: "ignored-teaser",
              name: "Teaser",
              official: true,
              published_at: "2026-01-01T00:00:00.000Z",
              site: "YouTube",
              size: 1080,
              type: "Teaser",
            },
          ],
        })
      )
    );

    await expect(getTmdbTrailerYouTubeId(1226863)).resolves.toBeUndefined();
  });

  it("returns undefined when no TMDB token is available for trailers", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(getTmdbTrailerYouTubeId(1226863)).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["TMDB returns a non-ok trailer response", vi.fn().mockResolvedValue(createResponse({}, false))],
    ["fetch throws while loading trailers", vi.fn().mockRejectedValue(new Error("network"))],
  ])("%s", async (_, fetchMock) => {
    vi.stubEnv("TMDB_BEARER_TOKEN", "test-token");
    vi.stubGlobal("fetch", fetchMock);

    await expect(getTmdbTrailerYouTubeId(1226863)).resolves.toBeUndefined();
  });

  it("returns the director and top billed cast from TMDB credits", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
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
      })
    );

    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("TMDB_BEARER_TOKEN", "test-token");

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

  it("returns cast with a fallback director label when no director is present", async () => {
    vi.stubEnv("TMDB_BEARER_TOKEN", "test-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        createResponse({
          id: 1226863,
          cast: [
            { id: 4, name: "Jack Black", order: 3 },
            { id: 2, name: "Charlie Day", order: 1 },
          ],
          crew: [{ id: 11, name: "Michael Jelenic", job: "Writer" }],
        })
      )
    );

    await expect(getTmdbCredits(1226863)).resolves.toEqual({
      director: "Director unavailable",
      cast: ["Charlie Day", "Jack Black"],
    });
  });

  it.each([
    [
      "returns undefined when neither director nor cast are present",
      vi.fn().mockResolvedValue(createResponse({ id: 1226863, cast: [], crew: [] })),
    ],
    [
      "returns undefined when TMDB credits response is not ok",
      vi.fn().mockResolvedValue(createResponse({}, false)),
    ],
    [
      "returns undefined when fetching credits throws",
      vi.fn().mockRejectedValue(new Error("network")),
    ],
  ])("%s", async (_, fetchMock) => {
    vi.stubEnv("TMDB_BEARER_TOKEN", "test-token");
    vi.stubGlobal("fetch", fetchMock);

    await expect(getTmdbCredits(1226863)).resolves.toBeUndefined();
  });

  it("returns undefined for credits when no TMDB token is available", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(getTmdbCredits(1226863)).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns formatted movie details from TMDB", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
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
      })
    );

    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("TMDB_BEARER_TOKEN", "test-token");

    await expect(getTmdbMovieDetails(1226863)).resolves.toEqual({
      title: "The Super Mario Galaxy Movie",
      tagline: "Adventure awaits among the stars.",
      synopsis: "Mario and Luigi race across the galaxy.",
      runtime: "1h 48m",
      genre: "Family / Adventure",
      poster: "https://image.tmdb.org/t/p/original/poster.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/backdrop.jpg",
      releaseDate: "Apr 1, 2026",
      releaseDateIso: "2026-04-01",
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

  it("applies detail fallbacks for empty tagline, missing media, invalid dates, and unknown language codes", async () => {
    vi.stubEnv("TMDB_BEARER_TOKEN", "test-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        createResponse({
          id: 1226863,
          title: "Mystery Movie",
          tagline: "",
          overview: "Overview",
          runtime: 0,
          release_date: "not-a-date",
          vote_average: 7,
          vote_count: 3,
          original_language: "zz",
          poster_path: null,
          backdrop_path: null,
          genres: [],
          production_companies: [],
        })
      )
    );
    vi.stubGlobal("Intl", {
      ...Intl,
      DisplayNames: class {
        constructor() {
          throw new Error("unsupported");
        }
      },
    });

    await expect(getTmdbMovieDetails(1226863)).resolves.toEqual({
      title: "Mystery Movie",
      tagline: "Imported from TMDB movie details.",
      synopsis: "Overview",
      runtime: "Runtime TBD",
      genre: "Genre unavailable",
      poster: "/next.svg",
      backdrop: "/next.svg",
      releaseDate: undefined,
      audienceScore: "7.0 / 10",
      originalLanguage: "ZZ",
      productionCompanies: [],
    });
  });

  it("formats short and exact-hour runtimes and leaves empty language codes undefined", async () => {
    vi.stubEnv("TMDB_BEARER_TOKEN", "test-token");
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(
          createResponse({
            id: 1,
            title: "Short Movie",
            tagline: "Tagline",
            overview: "Overview",
            runtime: 59,
            release_date: "",
            vote_average: 6.3,
            vote_count: 2,
            original_language: "",
            poster_path: "/poster.jpg",
            backdrop_path: "/backdrop.jpg",
            genres: [{ id: 12, name: "Adventure" }],
            production_companies: [],
          })
        )
        .mockResolvedValueOnce(
          createResponse({
            id: 2,
            title: "Long Movie",
            tagline: "Tagline",
            overview: "Overview",
            runtime: 120,
            release_date: "2026-04-01",
            vote_average: 6.3,
            vote_count: 2,
            original_language: "en",
            poster_path: "/poster.jpg",
            backdrop_path: "/backdrop.jpg",
            genres: [{ id: 12, name: "Adventure" }],
            production_companies: [],
          })
        )
    );

    await expect(getTmdbMovieDetails(1)).resolves.toMatchObject({
      runtime: "59m",
      releaseDate: undefined,
      originalLanguage: undefined,
    });
    await expect(getTmdbMovieDetails(2)).resolves.toMatchObject({
      runtime: "2h",
      releaseDate: "Apr 1, 2026",
      originalLanguage: "English",
    });
  });

  it("falls back to the uppercased language code when Intl.DisplayNames returns nothing", async () => {
    vi.stubEnv("TMDB_BEARER_TOKEN", "test-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        createResponse({
          id: 1226863,
          title: "Mystery Movie",
          tagline: "Tagline",
          overview: "Overview",
          runtime: 100,
          release_date: "2026-04-01",
          vote_average: 7,
          vote_count: 3,
          original_language: "zz",
          poster_path: "/poster.jpg",
          backdrop_path: "/backdrop.jpg",
          genres: [{ id: 1, name: "Drama" }],
          production_companies: [],
        })
      )
    );
    vi.spyOn(Intl, "DisplayNames").mockImplementation(
      () =>
        ({
          of: () => undefined,
        }) as unknown as Intl.DisplayNames
    );

    await expect(getTmdbMovieDetails(1226863)).resolves.toMatchObject({
      originalLanguage: "ZZ",
    });
  });

  it.each([
    ["returns undefined when no TMDB token is available", undefined],
    ["returns undefined on a non-ok details response", vi.fn().mockResolvedValue(createResponse({}, false))],
    ["returns undefined when fetching details throws", vi.fn().mockRejectedValue(new Error("network"))],
  ])("%s", async (_, fetchMock) => {
    if (fetchMock) {
      vi.stubEnv("TMDB_BEARER_TOKEN", "test-token");
      vi.stubGlobal("fetch", fetchMock);
    } else {
      vi.stubGlobal("fetch", vi.fn());
    }

    await expect(getTmdbMovieDetails(1226863)).resolves.toBeUndefined();
  });

  it("searches TMDB movies from a free-text query", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        page: 1,
        results: [searchResult],
        total_pages: 1,
        total_results: 1,
      })
    );

    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("TMDB_BEARER_TOKEN", "test-token");

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

  it.each([
    ["returns an empty list for blank queries", "   ", "test-token"],
    ["returns an empty list when no TMDB token is configured", "mario", undefined],
  ])("%s", async (_, query, token) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    if (token) {
      vi.stubEnv("TMDB_BEARER_TOKEN", token);
    }

    await expect(searchTmdbMovies(query)).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["returns an empty list when the search response is not ok", vi.fn().mockResolvedValue(createResponse({}, false))],
    ["returns an empty list when the search request throws", vi.fn().mockRejectedValue(new Error("network"))],
  ])("%s", async (_, fetchMock) => {
    vi.stubEnv("TMDB_BEARER_TOKEN", "test-token");
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchTmdbMovies("mario")).resolves.toEqual([]);
  });

  it("derives a release year from a search result", () => {
    expect(getTmdbSearchResultYear(searchResult)).toBe(2026);
  });

  it("returns undefined for a missing or invalid release year", () => {
    expect(
      getTmdbSearchResultYear({
        ...searchResult,
        release_date: "",
      })
    ).toBeUndefined();

    expect(
      getTmdbSearchResultYear({
        ...searchResult,
        release_date: "not-a-date",
      })
    ).toBeUndefined();
  });
});
