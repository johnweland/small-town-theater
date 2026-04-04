import Link from "next/link";

import {
  getAdminBookings,
  getAdminMovies,
  getAdminScreens,
  getAdminTheaters,
} from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSectionCard } from "@/components/admin/section-card";
import { AdminStatusBadge } from "@/components/admin/status-badge";

export default async function SchedulePage() {
  const [theaters, screens, movies, bookings] = await Promise.all([
    getAdminTheaters(),
    getAdminScreens(),
    getAdminMovies(),
    getAdminBookings(),
  ]);
  const theaterIds = new Set(theaters.map((theater) => theater.id));
  const screenIds = new Set(screens.map((screen) => screen.id));
  const movieSlugs = new Set(movies.map((movie) => movie.slug));
  const orphanedBookings = bookings.filter(
    (booking) =>
      !theaterIds.has(booking.theaterId) ||
      !screenIds.has(booking.screenId) ||
      !movieSlugs.has(booking.movieSlug)
  );

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Bookings"
        title="Schedule overview"
        description="Grouped by theater and screen so programming staff can scan the current run plan quickly."
        action={
          <Button asChild>
            <Link href="/admin/schedule/new">Add Booking</Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-8">
        {orphanedBookings.length > 0 ? (
          <AdminSectionCard
            title="Orphaned bookings"
            description="These bookings reference a theater, screen, or movie that no longer exists. Open them to review or delete the dangling record."
          >
            <div className="grid gap-4">
              {orphanedBookings.map((booking) => {
                const missingParts = [
                  theaterIds.has(booking.theaterId) ? null : "theater",
                  screenIds.has(booking.screenId) ? null : "screen",
                  movieSlugs.has(booking.movieSlug) ? null : "movie",
                ].filter((part): part is string => part !== null);
                const movie = movies.find((item) => item.slug === booking.movieSlug);

                return (
                  <Link
                    key={booking.id}
                    href={`/admin/schedule/${booking.id}`}
                    className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 transition-colors hover:bg-destructive/10"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-serif text-2xl italic text-foreground">
                          {movie?.title ?? booking.movieSlug}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {booking.runStartsOn} through {booking.runEndsOn}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <AdminStatusBadge status={booking.status} />
                        {movie?.status ? <AdminStatusBadge status={movie.status} /> : null}
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-destructive">
                      Missing {missingParts.join(", ")}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-background/70 px-3 py-1">
                        Theater ID: {booking.theaterId}
                      </span>
                      <span className="rounded-full bg-background/70 px-3 py-1">
                        Screen ID: {booking.screenId}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {booking.showtimes.map((showtime) => (
                        <span
                          key={showtime.day}
                          className="rounded-full bg-background/70 px-3 py-1 text-xs text-muted-foreground"
                        >
                          {showtime.day}: {showtime.times.join(", ")}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </AdminSectionCard>
        ) : null}

        {theaters.map((theater) => {
          const theaterScreens = screens.filter((screen) => screen.theaterId === theater.id);

          return (
            <AdminSectionCard
              key={theater.id}
              title={theater.name}
              description={`${theater.city}, ${theater.state}`}
            >
              <div className="flex flex-col gap-6">
                {theaterScreens.map((screen) => {
                  const screenBookings = bookings.filter(
                    (booking) => booking.screenId === screen.id
                  );

                  return (
                    <div key={screen.id} className="rounded-lg bg-surface-container-high p-5">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="font-serif text-2xl italic">{screen.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {screen.capacity} seats • {screen.projection}
                          </p>
                        </div>
                        <AdminStatusBadge status={screen.status} />
                      </div>
                      <div className="mt-5 grid gap-4">
                        {screenBookings.map((booking) => {
                          const movie = movies.find(
                            (item) => item.slug === booking.movieSlug
                          );
                          if (!movie) return null;

                          return (
                            <Link
                              key={booking.id}
                              href={`/admin/schedule/${booking.id}`}
                              className="rounded-lg bg-background/60 p-4"
                            >
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                  <p className="font-serif text-2xl italic text-foreground">
                                    {movie.title}
                                  </p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {booking.runStartsOn} through {booking.runEndsOn}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <AdminStatusBadge status={booking.status} />
                                  {movie.status ? <AdminStatusBadge status={movie.status} /> : null}
                                </div>
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {booking.showtimes.map((showtime) => (
                                  <span
                                    key={showtime.day}
                                    className="rounded-full bg-surface-container-highest px-3 py-1 text-xs text-muted-foreground"
                                  >
                                    {showtime.day}: {showtime.times.join(", ")}
                                  </span>
                                ))}
                              </div>
                              {booking.badge ? (
                                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                  Public badge: {booking.badge}
                                </p>
                              ) : null}
                            </Link>
                          );
                        })}
                        {screenBookings.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No bookings scheduled for this screen yet.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AdminSectionCard>
          );
        })}
      </div>
    </div>
  );
}
