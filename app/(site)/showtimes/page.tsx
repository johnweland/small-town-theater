import { getTheatersWithFilms } from "@/lib/data";
import { ShowtimeFilters } from "@/components/site/showtime-filters";

export default async function ShowtimesPage() {
  const theaters = await getTheatersWithFilms();

  return (
    <div className="bg-[#131313] text-[#e5e2e1]">
      {/* Header */}
      <section className="bg-[#1c1b1b] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#9c8f78]">
            Program &amp; Times
          </p>
          <h1 className="mt-3 font-serif text-5xl text-[#e5e2e1]">
            Showtimes
          </h1>
          <p className="mt-4 max-w-xl font-sans text-sm leading-6 text-[#d4c5ab]">
            Experience curated selections of contemporary masterpieces and
            restored classics across our two historic venues.
          </p>
        </div>
      </section>

      {/* Interactive listings — data fetched server-side, filtering happens client-side */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ShowtimeFilters theaters={theaters} />
        </div>
      </section>
    </div>
  );
}
