import { beforeEach, describe, expect, it, vi } from "vitest";

const { searchTmdbImportCandidatesMock } = vi.hoisted(() => ({
  searchTmdbImportCandidatesMock: vi.fn(),
}));

vi.mock("@/lib/admin", () => ({
  searchTmdbImportCandidates: searchTmdbImportCandidatesMock,
}));

import { handleTmdbSearchRequest } from "@/lib/server/tmdb-search-route";

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("handleTmdbSearchRequest", () => {
  it("returns candidates from the server-side TMDB search flow", async () => {
    vi.stubEnv("TMDB_BEARER_TOKEN", "test-token");
    searchTmdbImportCandidatesMock.mockResolvedValue([
      {
        id: "tmdb-1",
        title: "Mario",
      },
    ]);

    const response = await handleTmdbSearchRequest(
      new Request("http://localhost:3000/api/tmdb/search?query=mario")
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      candidates: [
        {
          id: "tmdb-1",
          title: "Mario",
        },
      ],
    });
    expect(searchTmdbImportCandidatesMock).toHaveBeenCalledWith("mario");
  });

  it("returns a clear 500 when TMDB_BEARER_TOKEN is missing", async () => {
    const response = await handleTmdbSearchRequest(
      new Request("http://localhost:3000/api/tmdb/search?query=mario")
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      candidates: [],
      error:
        "TMDB_BEARER_TOKEN is not configured on the server. Add TMDB_BEARER_TOKEN=<value> to your environment.",
    });
    expect(searchTmdbImportCandidatesMock).not.toHaveBeenCalled();
  });

  it("skips TMDB work for short queries", async () => {
    const response = await handleTmdbSearchRequest(
      new Request("http://localhost:3000/api/tmdb/search?query=m")
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ candidates: [] });
    expect(searchTmdbImportCandidatesMock).not.toHaveBeenCalled();
  });
});
