import { NextResponse } from "next/server";

import { searchTmdbImportCandidates } from "@/lib/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ candidates: [] });
  }

  const candidates = await searchTmdbImportCandidates(query);
  return NextResponse.json({ candidates });
}
