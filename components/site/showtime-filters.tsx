"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { TheaterWithBookings } from "@/lib/data";

const DAYS_TO_SHOW = 5;

function getDates() {
  const dates = [];
  const today = new Date();
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayNames[d.getDay()],
      day: d.getDate(),
      iso: d.toISOString().split("T")[0],
    });
  }
  return dates;
}

interface ShowtimeFiltersProps {
  theaters: TheaterWithBookings[];
}

export function ShowtimeFilters({ theaters }: ShowtimeFiltersProps) {
  const dates = getDates();
  const [selectedDate, setSelectedDate] = useState(dates[0].iso);
  const [selectedTheaterId, setSelectedTheaterId] = useState<string>("all");

  const visibleTheaters =
    selectedTheaterId === "all"
      ? theaters
      : theaters.filter((t) => t.id === selectedTheaterId);

  return (
    <div>
      <div className="mb-12 flex flex-col gap-8 border-b border-[#504532]/15 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.slice(0, 3).map((d) => (
            <button
              key={d.iso}
              onClick={() => setSelectedDate(d.iso)}
              className={`min-w-[120px] shrink-0 px-6 py-4 text-left transition-colors ${
                selectedDate === d.iso
                  ? "bg-[#ffbf00] text-[#402d00]"
                  : "bg-[#1c1b1b] text-[#e5e2e1] hover:bg-[#2a2a2a]"
              }`}
            >
              <span className="block font-sans text-xs uppercase tracking-[0.2em] opacity-70">
                {d.label}
              </span>
              <span className="mt-1 block font-serif text-2xl leading-none">
                {dayNamesFromIso(d.iso)}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1 bg-[#1c1b1b] p-1">
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
          {theaters.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTheaterId(t.id)}
              className={`px-5 py-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                selectedTheaterId === t.id
                  ? "bg-[#353534] text-[#ffe2ab]"
                  : "text-[#9c8f78] hover:text-[#e5e2e1]"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10">
        {visibleTheaters.map((theater) => (
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
                <article
                  key={booking.bookingId}
                  className="group grid gap-8 border-l-2 border-transparent bg-[#1c1b1b]/40 p-6 transition-all hover:border-[#ffbf00] hover:bg-[#1c1b1b] md:grid-cols-[160px_1fr]"
                >
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
                        {booking.times.map((time) => (
                          <button
                            key={time}
                            className="group/time border border-[#504532]/20 bg-[#2a2a2a] px-6 py-3 transition-colors hover:border-[#ffbf00]"
                          >
                            <span className="block font-sans text-xl font-bold tracking-tight text-[#e5e2e1]">
                              {time}
                            </span>
                            <span className="block pt-1 font-sans text-[10px] uppercase tracking-[0.2em] text-[#ffbf00] opacity-0 transition-opacity group-hover/time:opacity-100">
                              Buy Tickets
                            </span>
                          </button>
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
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function dayNamesFromIso(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return `${dayNames[date.getDay()]} ${date.getDate()}`;
}
