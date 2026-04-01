import Link from "next/link";

import { getImportCandidates, searchTmdbImportCandidates } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { AdminMovieImportFlow } from "@/components/admin/movie-import-flow";
import { AdminPageHeader } from "@/components/admin/page-header";

export default async function NewMoviePage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query = "" } = await searchParams;
  const trimmedQuery = query.trim();
  const candidates =
    trimmedQuery.length > 0
      ? await searchTmdbImportCandidates(trimmedQuery)
      : await getImportCandidates();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Import Flow"
        title="Import from TMDB"
        description="Search TMDB from the admin panel, review the result, and keep the import UX implementation-ready before persistence is added."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/movies">Back to Library</Link>
          </Button>
        }
      />
      <AdminMovieImportFlow candidates={candidates} initialQuery={trimmedQuery} />
    </div>
  );
}
