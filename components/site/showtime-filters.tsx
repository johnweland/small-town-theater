"use client";

import { useState } from "react";
import Link from "next/link";
import type { TheaterWithFilms } from "@/lib/data";

const DAYS_TO_SHOW = 5;

function getDates() {
  const dates = [];
  const today = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
  theaters: TheaterWithFilms[];
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
      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {dates.map((d) => (
          <button
            key={d.iso}
            onClick={() => setSelectedDate(d.iso)}
            className={`shrink-0 rounded-[0.125rem] px-4 py-2 font-sans text-sm transition-colors ${
              selectedDate === d.iso
                ? "bg-[#ffbf00] text-[#402d00] font-semibold"
                : "bg-[#201f1f] text-[#d4c5ab] hover:bg-[#2a2a2a]"
            }`}
          >
            <span className="block text-xs uppercase tracking-wider">
              {d.label}
            </span>
            <span className="block font-serif text-lg leading-tight">
              {d.day}
            </span>
          </button>
        ))}
      </div>

      {/* Theater filter */}
      <div className="mt-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedTheaterId("all")}
          className={`rounded-[0.125rem] px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${
            selectedTheaterId === "all"
              ? "bg-[#353534] text-[#ffe2ab]"
              : "text-[#9c8f78] hover:text-[#d4c5ab]"
          }`}
        >
          All Theaters
        </button>
        {theaters.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTheaterId(t.id)}
            className={`rounded-[0.125rem] px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${
              selectedTheaterId === t.id
                ? "bg-[#353534] text-[#ffe2ab]"
                : "text-[#9c8f78] hover:text-[#d4c5ab]"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Listings */}
      <div className="mt-10">
        {visibleTheaters.map((theater) => (
          <section key={theater.id} className="mb-16">
            <div className="mb-8">
              <h2 className="font-serif text-3xl text-[#ffe2ab]">
                {theater.name}
              </h2>
              <p className="mt-1 font-sans text-xs uppercase tracking-wider text-[#9c8f78]">
                {theater.district}
              </p>
            </div>

            <div className="space-y-px">
              {theater.films.map((film) => (
                <article
                  key={film.slug}
                  className="flex flex-col gap-6 bg-[#1c1b1b] p-6 sm:flex-row"
                >
                  {/* Poster */}
                  <div className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={film.poster}
                      alt={`${film.title} poster`}
                      className="h-36 w-24 rounded-[0.125rem] object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {film.badge && (
                      <span className="mb-2 inline-block rounded-[0.125rem] bg-[#353534] px-2 py-0.5 font-sans text-xs font-semibold uppercase tracking-wider text-[#ffe2ab]">
                        {film.badge}
                      </span>
                    )}
                    <Link href={`/movie/${film.slug}`}>
                      <h3 className="font-serif text-xl text-[#e5e2e1] hover:text-[#ffe2ab] transition-colors">
                        {film.title}
                      </h3>
                    </Link>
                    <p className="mt-0.5 font-sans text-xs uppercase tracking-wider text-[#9c8f78]">
                      {film.rating} · {film.runtime}
                    </p>
                    <p className="mt-2 font-sans text-sm leading-6 text-[#d4c5ab] line-clamp-2">
                      {film.synopsis}
                    </p>
                  </div>

                  {/* Showtimes */}
                  <div className="shrink-0">
                    <p className="mb-2 font-sans text-xs uppercase tracking-wider text-[#9c8f78]">
                      {film.price}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {film.times.map((time) => (
                        <button
                          key={time}
                          className="rounded-[0.125rem] bg-[#ffbf00] px-3 py-2 font-sans text-xs font-semibold text-[#402d00] transition-colors hover:bg-[#fbbc00]"
                        >
                          {time}
                        </button>
                      ))}
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
