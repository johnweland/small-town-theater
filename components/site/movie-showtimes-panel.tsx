"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { Movie, MovieShowtime } from "@/lib/data";
import { UpcomingDateFilters } from "@/components/site/upcoming-date-filters";
import {
  buildUpcomingDateFilters,
  filterUpcomingItems,
  getDefaultUpcomingFilterKey,
  type DatedBookingTimeSlot,
} from "@/lib/site/upcoming-schedule";

type VisibleMovieShowtime = Omit<MovieShowtime, "times"> & {
  times: DatedBookingTimeSlot[];
};

export function MovieShowtimesPanel({
  movie,
  showtimes,
}: {
  movie: Movie;
  showtimes: MovieShowtime[];
}) {
  const filters = useMemo(() => buildUpcomingDateFilters(showtimes), [showtimes]);
  const [selectedFilter, setSelectedFilter] = useState(() =>
    getDefaultUpcomingFilterKey(showtimes)
  );
  const filteredShowtimes = useMemo(
    () => filterUpcomingItems(showtimes, selectedFilter),
    [selectedFilter, showtimes]
  );
  return (
    <section className="mx-auto mt-32 max-w-7xl space-y-16 px-6 pb-20 lg:px-8">
      <div className="flex flex-col gap-6 border-b border-[#504532]/20 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-serif text-5xl text-[#e5e2e1]">Book Your Seat</h2>
          <p className="mt-3 font-sans text-sm uppercase tracking-[0.2em] text-[#9c8f78]">
            Choose a theater and time
          </p>
        </div>
        <UpcomingDateFilters
          filters={filters}
          selectedKey={selectedFilter}
          onSelect={setSelectedFilter}
        />
      </div>

      {selectedFilter === "all-upcoming" ? (
        <div className="space-y-16">
          <div className="grid gap-12 xl:grid-cols-2">
            {filteredShowtimes.map((showtime) => (
              <ShowtimeCard key={showtime.bookingId} showtime={showtime} />
            ))}
          </div>

          {movie.status === "coming-soon" ? (
            <section className="rounded-[0.125rem] border border-[#504532]/20 bg-[#1c1b1b]/50 p-8">
              <p className="font-sans text-xs uppercase tracking-[0.25em] text-[#9c8f78]">
                Coming Soon
              </p>
              <h3 className="mt-4 font-serif text-4xl italic text-[#e5e2e1]">
                More dates to be announced
              </h3>
              <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-[#d4c5ab]">
                {movie.title} is marked as coming soon. Public playtimes may expand as additional engagements are locked in.
              </p>
            </section>
          ) : null}
        </div>
      ) : filteredShowtimes.length > 0 ? (
        <div className="grid gap-12 xl:grid-cols-2">
          {filteredShowtimes.map((showtime) => (
            <ShowtimeCard key={showtime.bookingId} showtime={showtime} />
          ))}
        </div>
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
    </section>
  );
}

function ShowtimeCard({
  showtime,
}: {
  showtime: VisibleMovieShowtime;
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <span className="font-sans text-xl text-[#ffbf00]">
          {showtime.badge ? "◉" : "◌"}
        </span>
        <div>
          <Link href={`/theaters/${showtime.theaterSlug}`}>
            <h3 className="font-serif text-3xl italic text-[#e5e2e1] transition-colors hover:text-[#ffe2ab]">
              {showtime.theaterName}
            </h3>
          </Link>
          <p className="mt-2 font-sans text-xs uppercase tracking-[0.2em] text-[#9c8f78]">
            {showtime.screenName} • {showtime.runStartsOn} to {showtime.runEndsOn}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {showtime.times.map((slot, slotIndex) => (
          <div
            key={`${showtime.bookingId}-${slot.isoDate}-${slot.time}-${slotIndex}`}
            className="flex min-h-[160px] flex-col justify-between bg-[#1c1b1b] p-8 transition-colors hover:bg-[#2a2a2a]"
          >
            <div>
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9c8f78]">
                {slot.dateLabel}
              </p>
              <p className="font-sans text-3xl font-bold text-[#ffe2ab]">
                {slot.time}
              </p>
              <p
                className={`mt-1 font-sans text-xs font-bold uppercase tracking-[0.2em] ${
                  showtime.badge ? "text-[#ffb4ab]" : "text-[#9c8f78]"
                }`}
              >
                {showtime.badge ?? "Standard Cinema"}
              </p>
            </div>
            <button className="mt-6 w-full bg-[#ffbf00] py-4 font-sans text-sm font-bold uppercase tracking-[0.15em] text-[#402d00] transition-colors hover:bg-[#fbbc00]">
              Buy Tickets — {showtime.price}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
