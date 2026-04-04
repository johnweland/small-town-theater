import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAdminBooking,
  getAdminMovies,
  getAdminScreens,
  getAdminTheaters,
} from "@/lib/admin";
import {
  deleteBookingAction,
  updateBookingAction,
} from "@/app/(admin)/admin/schedule/actions";
import { Button } from "@/components/ui/button";
import { AdminBookingForm } from "@/components/admin/booking-form";
import { AdminPageHeader } from "@/components/admin/page-header";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const [booking, theaters, screens, movies] = await Promise.all([
    getAdminBooking(bookingId),
    getAdminTheaters(),
    getAdminScreens(),
    getAdminMovies(),
  ]);

  if (!booking) notFound();

  const theater = theaters.find((item) => item.id === booking.theaterId) ?? null;
  const screen = screens.find((item) => item.id === booking.screenId) ?? null;
  const movie = movies.find((item) => item.slug === booking.movieSlug) ?? null;
  const missingParts = [
    theater ? null : "theater",
    screen ? null : "screen",
    movie ? null : "movie",
  ].filter((part): part is string => part !== null);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Booking Detail"
        title="Edit booking"
        description={
          missingParts.length > 0
            ? `This booking is orphaned because its ${missingParts.join(", ")} record${missingParts.length === 1 ? " has" : "s have"} been removed. You can still delete it here.`
            : "Update run dates, room assignment, recurring times, and exceptions."
        }
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
        booking={booking}
        action={updateBookingAction.bind(null, booking.id)}
        deleteAction={deleteBookingAction}
      />
    </div>
  );
}
