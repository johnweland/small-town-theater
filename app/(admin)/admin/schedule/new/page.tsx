import Link from "next/link";

import {
  getAdminMovies,
  getAdminScreens,
  getAdminTheaters,
} from "@/lib/admin";
import { createBookingAction } from "@/app/(admin)/admin/schedule/actions";
import { Button } from "@/components/ui/button";
import { AdminBookingForm } from "@/components/admin/booking-form";
import { AdminPageHeader } from "@/components/admin/page-header";

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ movieId?: string }>;
}) {
  const { movieId } = await searchParams;
  const [theaters, screens, movies] = await Promise.all([
    getAdminTheaters(),
    getAdminScreens(),
    getAdminMovies(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="New Booking"
        title="Create a booking"
        description="Set the theater, screen, movie, and recurring showtimes for a new booking."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/schedule">Back to Schedule</Link>
          </Button>
        }
      />
      <AdminBookingForm
        theaters={theaters}
        screens={screens}
        movies={movies}
        action={createBookingAction}
        defaultMovieId={movieId}
      />
    </div>
  );
}
