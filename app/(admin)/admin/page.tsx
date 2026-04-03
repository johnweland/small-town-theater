/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Building2, CalendarDays, Film, MonitorPlay, Ticket } from "lucide-react";

import {
  getAdminBookings,
  getAdminEvents,
  getAdminMovies,
  getAdminRecentActivity,
  getAdminScreens,
  getAdminTheaters,
} from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSectionCard } from "@/components/admin/section-card";
import { AdminStatCard } from "@/components/admin/stat-card";
import { AdminStatusBadge } from "@/components/admin/status-badge";

export default async function AdminDashboardPage() {
  const [theaters, screens, movies, bookings, events, activity] = await Promise.all([
    getAdminTheaters(),
    getAdminScreens(),
    getAdminMovies(),
    getAdminBookings(),
    getAdminEvents(),
    getAdminRecentActivity(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Management Console"
        title="Community cinema operations"
        description="A warm, implementation-ready front end for programming, scheduling, and venue management across the Small Town Theater network."
        action={
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/events/new">Add Event</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/schedule/new">New Booking</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Theaters" value={String(theaters.length)} meta="network locations" icon={<Building2 className="size-4 text-primary" />} />
        <AdminStatCard label="Screens" value={String(screens.length)} meta="managed rooms" icon={<MonitorPlay className="size-4 text-primary" />} />
        <AdminStatCard label="Movies" value={String(movies.length)} meta="local catalog" icon={<Film className="size-4 text-primary" />} />
        <AdminStatCard label="Bookings" value={String(bookings.length)} meta="active planning" accent icon={<CalendarDays className="size-4 text-primary" />} />
        <AdminStatCard label="Events" value={String(events.length)} meta="community programs" icon={<Ticket className="size-4 text-primary" />} />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-8">
          <AdminSectionCard
            title="Quick Actions"
            description="The most common staff workflows are surfaced first so the panel feels useful on day one."
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { href: "/admin/theaters/new", label: "Add Theater" },
                { href: "/admin/movies/new", label: "Import Movie" },
                { href: "/admin/schedule/new", label: "Create Booking" },
                { href: "/admin/events/new", label: "Plan Event" },
              ].map((item) => (
                <Button key={item.href} asChild variant="outline" className="h-16 justify-start">
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Currently Playing"
            description="Quick read on films already in rotation and where they are booked."
          >
            <div className="grid gap-4">
              {movies
                .filter((movie) => movie.status === "now-playing")
                .map((movie) => {
                  const count = bookings.filter(
                    (booking) => booking.movieSlug === movie.slug
                  ).length;
                  return (
                    <div
                      key={movie.id}
                      className="flex flex-col gap-4 rounded-lg bg-surface-container-high p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <p className="font-serif text-2xl italic text-foreground">
                          {movie.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {movie.year} • {movie.runtimeMinutes} min • {count} booking{count === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {movie.status ? <AdminStatusBadge status={movie.status} /> : null}
                        <Button asChild variant="outline">
                          <Link href={`/admin/movies/${movie.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </AdminSectionCard>
        </div>

        <div className="flex flex-col gap-8">
          <AdminSectionCard title="Coming Soon" description="Queued titles ready for marketing and scheduling.">
            <div className="flex flex-col gap-3">
              {movies
                .filter((movie) => movie.status === "coming-soon")
                .map((movie) => (
                  <div key={movie.id} className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-high p-4">
                    <div>
                      <p className="font-serif text-xl italic">{movie.title}</p>
                      <p className="text-sm text-muted-foreground">{movie.genres.join(" / ")}</p>
                    </div>
                    {movie.status ? <AdminStatusBadge status={movie.status} /> : null}
                  </div>
                ))}
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Upcoming Events" description="Community touchpoints that keep the theaters feeling local and alive.">
            <div className="flex flex-col gap-3">
              {events.map((event) => (
                <div key={event.id} className="rounded-lg bg-surface-container-high p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={event.imagePreview ?? event.image}
                      alt={`${event.title} poster`}
                      className="h-24 w-[72px] rounded-md object-cover"
                    />
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-serif text-xl italic">{event.title}</p>
                        <AdminStatusBadge status={event.status} />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{event.summary}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {event.startsAtLabel}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Recent Activity" description="A quick view of the latest activity across programming and operations.">
            <div className="flex flex-col gap-4">
              {activity.map((item) => (
                <div key={item.id} className="rounded-lg bg-surface-container-high p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-sans text-sm font-semibold text-foreground">{item.title}</p>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {item.occurredAt}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
