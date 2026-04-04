import { searchTmdbImportCandidates } from "@/lib/admin";

function getRequiredTmdbBearerToken() {
  const token = process.env.TMDB_BEARER_TOKEN;
  console.info(`[tmdb-search] TMDB_BEARER_TOKEN configured: ${Boolean(token)}`);

  if (!token) {
    throw new Error(
      "TMDB_BEARER_TOKEN is not configured on the server. Add TMDB_BEARER_TOKEN=<value> to your environment."
    );
  }

  return token;
}

export async function handleTmdbSearchRequest(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";

  if (query.length < 2) {
    return Response.json({ candidates: [] });
  }

  try {
    getRequiredTmdbBearerToken();
    // Rate limiting placeholder: add per-IP throttling here if TMDB search abuse becomes a concern.
    const candidates = await searchTmdbImportCandidates(query);

    return Response.json({ candidates });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to search TMDB right now.";

    console.error("[tmdb-search] Search failed.", error);

    return Response.json(
      {
        candidates: [],
        error: message,
      },
      { status: 500 }
    );
  }
}
