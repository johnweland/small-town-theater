"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { Movie, TheaterWithBookings } from "@/lib/data";
import { ComingSoonList } from "@/components/site/coming-soon-list";
import { UpcomingDateFilters } from "@/components/site/upcoming-date-filters";
import {
  buildUpcomingDateFilters,
  filterUpcomingItems,
  getDefaultUpcomingFilterKey,
  getUnscheduledComingSoonMovies,
  type DatedBookingTimeSlot,
} from "@/lib/site/upcoming-schedule";

type BookingCard = Omit<TheaterWithBookings["bookings"][number], "times"> & {
  times: DatedBookingTimeSlot[];
};

export function ShowtimeFilters({
  theaters,
  comingSoonMovies,
}: {
  theaters: TheaterWithBookings[];
  comingSoonMovies: Movie[];
}) {
  const allBookings = useMemo(
    () => theaters.flatMap((theater) => theater.bookings),
    [theaters],
  );
  const filters = useMemo(
    () => buildUpcomingDateFilters(allBookings),
    [allBookings],
  );
  const [selectedFilter, setSelectedFilter] = useState(() =>
    getDefaultUpcomingFilterKey(allBookings),
  );
  const [selectedTheaterId, setSelectedTheaterId] = useState<string>("all");

  const visibleTheaters =
    selectedTheaterId === "all"
      ? theaters
      : theaters.filter((theater) => theater.id === selectedTheaterId);

  const filteredTheaters = useMemo(
    () =>
      visibleTheaters
        .map((theater) => ({
          ...theater,
          bookings: filterUpcomingItems(theater.bookings, selectedFilter),
        }))
        .filter((theater) => theater.bookings.length > 0),
    [selectedFilter, visibleTheaters],
  );

  const unscheduledComingSoonMovies = useMemo(
    () => getUnscheduledComingSoonMovies(comingSoonMovies, allBookings),
    [allBookings, comingSoonMovies],
  );

  return (
    <div>
      <div className="mb-12 grid gap-6 border-b border-[#504532]/15 pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <UpcomingDateFilters
            filters={filters}
            selectedKey={selectedFilter}
            onSelect={setSelectedFilter}
          />
        </div>

        <div className="flex flex-wrap gap-1 self-start bg-[#1c1b1b] p-1 lg:justify-self-end">
          <button
            onClick={() => setSelectedTheaterId("all")}
            className={`px-5 py-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
              selectedTheaterId === "all"
                ? "bg-[#353534] text-[#ffe2ab]"
                : "text-[#9c8f78] hover:text-[#e5e2e1]"
            }`}
          >
            All Theaters
          </button>
          {theaters.map((theater) => (
            <button
              key={theater.id}
              onClick={() => setSelectedTheaterId(theater.id)}
              className={`px-5 py-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                selectedTheaterId === theater.id
                  ? "bg-[#353534] text-[#ffe2ab]"
                  : "text-[#9c8f78] hover:text-[#e5e2e1]"
              }`}
            >
              {theater.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 space-y-16">
        {selectedFilter === "all-upcoming" ? (
          <>
            {filteredTheaters.map((theater) => (
              <section key={theater.id} className="mb-16">
                <div className="mb-8 flex items-baseline gap-4">
                  <h2 className="font-serif text-4xl italic text-[#ffb4ab]">
                    {theater.name}
                  </h2>
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#9c8f78]/60">
                    {theater.district}
                  </p>
                </div>

                <div className="grid gap-px">
                  {theater.bookings.map((booking) => (
                    <BookingCardView
                      key={booking.bookingId}
                      booking={booking}
                    />
                  ))}
                </div>
              </section>
            ))}
          </>
        ) : (
          <>
            {filteredTheaters.map((theater) => (
              <section key={theater.id} className="mb-16">
                <div className="mb-8 flex items-baseline gap-4">
                  <h2 className="font-serif text-4xl italic text-[#ffb4ab]">
                    {theater.name}
                  </h2>
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#9c8f78]/60">
                    {theater.district}
                  </p>
                </div>

                <div className="grid gap-px">
                  {theater.bookings.map((booking) => (
                    <BookingCardView
                      key={booking.bookingId}
                      booking={booking}
                    />
                  ))}
                </div>
              </section>
            ))}

            {filteredTheaters.length === 0 ? (
              <div className="rounded-[0.125rem] border border-[#504532]/20 bg-[#1c1b1b]/50 p-8 text-center">
                <p className="font-serif text-3xl italic text-[#e5e2e1]">
                  No showtimes for this date.
                </p>
                <p className="mt-3 font-sans text-sm text-[#9c8f78]">
                  Choose another upcoming date or switch to All Upcoming.
                </p>
              </div>
            ) : null}
          </>
        )}

        <ComingSoonList
          title="Unscheduled Highlights"
          description="These titles are on the horizon but do not yet have concrete public showtimes."
          movies={unscheduledComingSoonMovies}
        />
      </div>
    </div>
  );
}

function BookingCardView({ booking }: { booking: BookingCard }) {
  return (
    <article className="group grid gap-8 border-l-2 border-transparent bg-[#1c1b1b]/40 p-6 transition-all hover:border-[#ffbf00] hover:bg-[#1c1b1b] md:grid-cols-[160px_1fr]">
      <div className="relative aspect-[2/3] overflow-hidden bg-[#201f1f] shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <Image
          src={booking.poster}
          alt={`${booking.title} poster`}
          fill
          sizes="(max-width: 768px) 100vw, 160px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {booking.badge ? (
          <span className="absolute left-2 top-2 bg-[#a0030e] px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#ffa99f]">
            {booking.badge}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <Link href={`/movie/${booking.slug}`}>
              <h3 className="font-serif text-3xl text-[#e5e2e1] transition-colors group-hover:text-[#ffe2ab]">
                {booking.title}
              </h3>
            </Link>
            <span className="border border-[#504532]/50 px-2 py-1 font-sans text-[0.7rem] uppercase tracking-[0.2em] text-[#9c8f78]">
              {booking.rating} / {booking.runtime}
            </span>
          </div>
          <p className="mb-3 font-sans text-[0.7rem] uppercase tracking-[0.2em] text-[#9c8f78]">
            {booking.screenName} • {booking.runStartsOn} to {booking.runEndsOn}
          </p>
          <p className="max-w-2xl font-sans text-sm leading-7 text-[#d4c5ab] line-clamp-2">
            {booking.synopsis}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-wrap gap-3">
            {booking.times.map((slot, slotIndex) => (
              <SlotButton
                key={`${booking.bookingId}-${slot.isoDate}-${slot.time}-${slotIndex}`}
                slot={slot}
              />
            ))}
          </div>

          <div className="flex items-center gap-6">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#9c8f78]">
              {booking.price}
            </p>
            <Link
              href={`/movie/${booking.slug}`}
              className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#ffe2ab] transition-colors hover:text-[#ffbf00]"
            >
              Film Details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function SlotButton({ slot }: { slot: DatedBookingTimeSlot }) {
  return (
    <button className="group/time border border-[#504532]/20 bg-[#2a2a2a] px-6 py-3 transition-colors hover:border-[#ffbf00]">
      <span className="block pb-1 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9c8f78]">
        {slot.dateLabel}
      </span>
      <span className="block font-sans text-xl font-bold tracking-tight text-[#e5e2e1]">
        {slot.time}
      </span>
      <span className="block pt-1 font-sans text-[10px] uppercase tracking-[0.2em] text-[#ffbf00] opacity-0 transition-opacity group-hover/time:opacity-100">
        Tickets at the Box Office
      </span>
    </button>
  );
}
