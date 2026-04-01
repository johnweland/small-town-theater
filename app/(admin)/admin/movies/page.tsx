import Link from "next/link";

import { getAdminBookings, getAdminMovies } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { AdminMoviesLibraryView } from "@/components/admin/movies-library-view";
import { AdminPageHeader } from "@/components/admin/page-header";

export default async function MoviesPage() {
  const [movies, bookings] = await Promise.all([
    getAdminMovies(),
    getAdminBookings(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Library"
        title="Movies library"
        description="A searchable, implementation-ready catalog with poster-driven browsing and direct handoff into the booking flow."
        action={
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/schedule/new">Create Booking</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/movies/new">Import Movie</Link>
            </Button>
          </div>
        }
      />
      <AdminMoviesLibraryView movies={movies} bookings={bookings} />
    </div>
  );
}
