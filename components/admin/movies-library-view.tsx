"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { AdminBooking, AdminMovie } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminSectionCard } from "@/components/admin/section-card";
import { AdminStatusBadge } from "@/components/admin/status-badge";

export function AdminMoviesLibraryView({
  movies,
  bookings,
}: {
  movies: AdminMovie[];
  bookings: AdminBooking[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return movies.filter((movie) => {
      const matchesQuery =
        query.trim().length === 0 ||
        `${movie.title} ${movie.year} ${movie.genres.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase());
      const matchesStatus = status === "all" || movie.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [movies, query, status]);

  return (
    <div className="flex flex-col gap-8">
      <AdminSectionCard
        title="Library Filters"
        description="Search the catalog and pivot quickly between active films, queued imports, and archive titles."
      >
        <div className="flex flex-col gap-4 lg:flex-row">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, year, or genre..."
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-11 rounded-md border border-border/40 bg-surface-container-highest px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="now-playing">Now playing</option>
            <option value="coming-soon">Coming soon</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </AdminSectionCard>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((movie) => {
          const bookingCount = bookings.filter(
            (booking) => booking.movieSlug === movie.slug
          ).length;

          return (
            <AdminSectionCard
              key={movie.id}
              title={movie.title}
              description={`${movie.year} • ${movie.runtimeMinutes} min • ${movie.genres.join(" / ")}`}
              className="flex h-full flex-col overflow-hidden"
              contentClassName="flex flex-1 flex-col gap-5"
              action={<AdminStatusBadge status={movie.status} />}
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                <Image
                  src={movie.backdrop}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 1280px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p className="line-clamp-4">{movie.overview}</p>
              </div>
              <div className="mt-auto flex flex-col gap-4">
                <p>{bookingCount} related booking{bookingCount === 1 ? "" : "s"}</p>
                <div className="flex items-center gap-3">
                  <Button asChild variant="outline">
                    <Link href={`/admin/movies/${movie.id}`}>Open Detail</Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/admin/schedule/new?movieId=${movie.id}`}>
                      Create Booking
                    </Link>
                  </Button>
                </div>
              </div>
            </AdminSectionCard>
          );
        })}
      </div>
    </div>
  );
}
