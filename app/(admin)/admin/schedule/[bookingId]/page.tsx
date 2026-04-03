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

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Booking Detail"
        title="Edit booking"
        description="Update run dates, room assignment, recurring times, and exceptions."
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
