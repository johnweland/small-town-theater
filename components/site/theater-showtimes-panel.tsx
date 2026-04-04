"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { Movie, TheaterWithShowtimes } from "@/lib/data";
import { ComingSoonList } from "@/components/site/coming-soon-list";
import { UpcomingDateFilters } from "@/components/site/upcoming-date-filters";
import {
  buildUpcomingDateFilters,
  filterUpcomingItems,
  getDefaultUpcomingFilterKey,
  getUnscheduledComingSoonMovies,
  type DatedBookingTimeSlot,
} from "@/lib/site/upcoming-schedule";
import { APP_NAME } from "@/lib/config";

type VisibleTheaterBooking = Omit<TheaterWithShowtimes["currentBookings"][number], "times"> & {
  times: DatedBookingTimeSlot[];
};

export function TheaterShowtimesPanel({
  theater,
  comingSoonMovies,
}: {
  theater: TheaterWithShowtimes;
  comingSoonMovies: Movie[];
}) {
  const filters = useMemo(
    () => buildUpcomingDateFilters(theater.currentBookings),
    [theater.currentBookings]
  );
  const [selectedFilter, setSelectedFilter] = useState(() =>
    getDefaultUpcomingFilterKey(theater.currentBookings)
  );
  const featuredBooking = theater.currentBookings[0] ?? null;

  const filteredBookings = useMemo(
    () => filterUpcomingItems(theater.currentBookings, selectedFilter),
    [selectedFilter, theater.currentBookings]
  );
  const unscheduledComingSoonMovies = useMemo(
    () => getUnscheduledComingSoonMovies(comingSoonMovies, theater.currentBookings),
    [comingSoonMovies, theater.currentBookings]
  );

  return (
    <section className="bg-[#0e0e0e] px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.25em] text-[#9c8f78]">
              On Screen Now
            </p>
            <h2 className="mt-4 font-serif text-5xl italic text-[#e5e2e1] md:text-6xl">
              Theater View
            </h2>
            <p className="mt-3 font-sans text-sm text-[#9c8f78]">
              Curated showtimes for {theater.name}.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <UpcomingDateFilters
              filters={filters}
              selectedKey={selectedFilter}
              onSelect={setSelectedFilter}
            />
            <Link
              href="/showtimes"
              className="inline-flex items-center justify-center border border-[#9c8f78] px-6 py-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#e5e2e1] transition-colors hover:bg-[#e5e2e1] hover:text-[#131313]"
            >
              View Full Schedule
            </Link>
          </div>
        </div>

        <div className="mt-16 space-y-16">
          {selectedFilter === "all-upcoming" ? (
            <>
              {filteredBookings.map((booking) => (
                <BookingArticle
                  key={booking.bookingId}
                  booking={booking}
                  isFeatured={featuredBooking?.bookingId === booking.bookingId}
                />
              ))}

              <ComingSoonList
                title="Across the Network"
                description={`These coming-soon titles are headed to ${APP_NAME} but do not yet have concrete public showtimes.`}
                movies={unscheduledComingSoonMovies}
              />
            </>
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <BookingArticle
                key={booking.bookingId}
                booking={booking}
                isFeatured={featuredBooking?.bookingId === booking.bookingId}
              />
            ))
          ) : (
            <div className="rounded-[0.125rem] border border-[#504532]/20 bg-[#1c1b1b]/50 p-8 text-center">
              <p className="font-serif text-3xl italic text-[#e5e2e1]">
                No showtimes for this date.
              </p>
              <p className="mt-3 font-sans text-sm text-[#9c8f78]">
                Choose another upcoming date or switch to All Upcoming.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BookingArticle({
  booking,
  isFeatured,
}: {
  booking: VisibleTheaterBooking;
  isFeatured: boolean;
}) {
  return (
    <article className="grid gap-10 md:grid-cols-12">
      <div className="md:col-span-3">
        <div className="relative aspect-[2/3] overflow-hidden bg-[#201f1f] shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          <Image
            src={booking.poster}
            alt={booking.title}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="md:col-span-9">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {booking.badge ? (
            <span className="bg-[#a0030e] px-2 py-1 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#ffa99f]">
              {booking.badge}
            </span>
          ) : null}
          {booking.isNew ? (
            <span className="bg-[#353534] px-2 py-1 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#ffe2ab]">
              New Release
            </span>
          ) : null}
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#9c8f78]">
            {booking.rating} · {booking.runtime}
          </span>
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#9c8f78]">
            {booking.screenName}
          </span>
        </div>

        <h3 className="font-serif text-5xl text-[#e5e2e1] md:text-6xl">{booking.title}</h3>
        <p className="mt-6 max-w-2xl font-sans text-lg leading-8 text-[#d4c5ab]">
          {booking.synopsis}
        </p>
        <p className="mt-4 font-sans text-xs uppercase tracking-[0.2em] text-[#9c8f78]">
          Runs {booking.runStartsOn} through {booking.runEndsOn}
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          {booking.times.map((slot, timeIndex) => (
            <button
              key={`${booking.bookingId}-${slot.isoDate}-${slot.time}-${timeIndex}`}
              className={`px-6 py-3 font-sans text-sm font-semibold transition-colors ${
                isFeatured && timeIndex === booking.times.length - 1
                  ? "bg-[#ffbf00] text-[#402d00] shadow-[0_20px_40px_rgba(251,188,0,0.15)]"
                  : "bg-[#2a2a2a] text-[#e5e2e1] hover:bg-[#ffbf00] hover:text-[#402d00]"
              }`}
            >
              {slot.dateLabel} {slot.time}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Link
            href={`/movie/${booking.slug}`}
            className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#ffe2ab] transition-colors hover:text-[#ffbf00]"
          >
            View Film Details
          </Link>
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#9c8f78]">
            Tickets {booking.price}
          </p>
        </div>
      </div>
    </article>
  );
}
