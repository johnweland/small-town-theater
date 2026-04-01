import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminBookings, getAdminMovieDetail } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSectionCard } from "@/components/admin/section-card";
import { AdminStatusBadge } from "@/components/admin/status-badge";
import { TrailerPlayer } from "@/components/site/trailer-player";

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = await params;
  const detail = await getAdminMovieDetail(movieId);
  if (!detail) notFound();
  const { adminMovie, movie, showtimes } = detail;
  if (!movie) notFound();

  const bookings = (await getAdminBookings()).filter(
    (booking) => booking.movieSlug === adminMovie.slug
  );

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Movie Detail"
        title={movie.title}
        description={`${movie.releaseDate ?? "Release date TBD"} • ${movie.runtime} • ${movie.genre}`}
        action={
          <div className="flex gap-3">
            <AdminStatusBadge status={adminMovie.status} />
            <Button asChild>
              <Link href={`/admin/schedule/new?movieId=${adminMovie.id}`}>Create Booking</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminSectionCard title="Media & Metadata" description={movie.tagline}>
          <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
              <Image
                src={movie.poster}
                alt={`${movie.title} poster`}
                fill
                sizes="220px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-5">
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                <Image
                  src={movie.backdrop}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 1280px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{movie.synopsis}</p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-lg bg-surface-container-high p-4">
                  <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                    Rating
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{movie.rating}</p>
                </div>
                <div className="rounded-lg bg-surface-container-high p-4">
                  <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                    Audience Score
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {movie.audienceScore ?? movie.score}
                  </p>
                </div>
                <div className="rounded-lg bg-surface-container-high p-4">
                  <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                    Language
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {movie.originalLanguage ?? "English"}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-surface-container-high p-4">
                  <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                    Studios
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {(movie.productionCompanies ?? [movie.production]).join(", ")}
                  </p>
                </div>
                <div className="rounded-lg bg-surface-container-high p-4">
                  <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                    Internal Library Status
                  </p>
                  <div className="mt-2">
                    <AdminStatusBadge status={adminMovie.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AdminSectionCard>

        <div className="flex flex-col gap-8">
          <AdminSectionCard title="Trailer" description="Pulled from the richer movie detail source used by the site.">
            <TrailerPlayer
              title={movie.title}
              backdrop={movie.backdrop}
              trailerYouTubeId={movie.trailerYouTubeId}
            />
          </AdminSectionCard>

          <AdminSectionCard title="Cast Highlights" description="Canonical movie metadata with richer detail available to programming staff.">
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              {movie.cast.map((credit) => (
                <li key={credit} className="rounded-lg bg-surface-container-high p-4">
                  {credit}
                </li>
              ))}
            </ul>
          </AdminSectionCard>

          <AdminSectionCard title="Current Showtimes" description="Related bookings drive these public-facing showtimes without becoming part of the movie record itself.">
            <div className="flex flex-col gap-3">
              {showtimes.length > 0 ? (
                showtimes.map((showtime) => (
                  <div
                    key={showtime.bookingId}
                    className="rounded-lg bg-surface-container-high p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-serif text-xl italic text-foreground">
                        {showtime.theaterName}
                      </p>
                      {showtime.badge ? (
                        <AdminStatusBadge status={showtime.badge.toLowerCase()} />
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {showtime.screenName} • {showtime.runStartsOn} through {showtime.runEndsOn}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {showtime.times.join(", ")} • {showtime.price}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg bg-surface-container-high p-4 text-sm text-muted-foreground">
                  No showtimes currently attached.
                </p>
              )}
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Related Bookings" description="Each booking owns the theater, screen, run dates, and recurring showtimes for this title.">
            <div className="flex flex-col gap-3">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/admin/schedule/${booking.id}`}
                    className="rounded-lg bg-surface-container-high p-4"
                  >
                    <p className="font-sans text-sm font-semibold text-foreground">{booking.note}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {booking.runStartsOn} through {booking.runEndsOn}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="rounded-lg bg-surface-container-high p-4 text-sm text-muted-foreground">
                  No bookings yet.
                </p>
              )}
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
