import { handleTmdbSearchRequest } from "@/lib/server/tmdb-search-route";

export async function GET(request: Request) {
  return handleTmdbSearchRequest(request);
}
