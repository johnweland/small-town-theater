import Link from "next/link";

import {
  getAdminMovies,
  getAdminScreens,
  getAdminTheaters,
} from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { AdminBookingForm } from "@/components/admin/booking-form";
import { AdminPageHeader } from "@/components/admin/page-header";

export default async function NewBookingPage() {
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
        description="The scheduling form is already structured around future persisted relationships and recurring showtime rules."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/schedule">Back to Schedule</Link>
          </Button>
        }
      />
      <AdminBookingForm theaters={theaters} screens={screens} movies={movies} />
    </div>
  );
}
