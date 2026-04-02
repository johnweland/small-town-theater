import { getComingSoonMovies, getTheatersWithBookings } from "@/lib/data";
import { ShowtimeFilters } from "@/components/site/showtime-filters";

export default async function ShowtimesPage() {
  const [theaters, comingSoonMovies] = await Promise.all([
    getTheatersWithBookings(),
    getComingSoonMovies(),
  ]);

  return (
    <div className="bg-[#131313] text-[#e5e2e1]">
      <section className="mx-auto max-w-7xl px-6 pb-6 pt-28 lg:px-8">
        <div className="relative">
          <div className="absolute -left-4 top-0 hidden h-24 w-px bg-[#a0030e] sm:block" />
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#9c8f78]">
            Program &amp; Times
          </p>
          <h1 className="mt-4 font-serif text-6xl italic leading-none text-[#ffe2ab] md:text-8xl">
            Program <span className="not-italic text-[#e5e2e1]/20">&amp;</span>{" "}
            Times
          </h1>
          <p className="mt-5 max-w-2xl font-sans text-lg leading-8 text-[#d4c5ab]">
            Experience the curated selection of contemporary masterpieces and
            restored classics across our historic venues.
          </p>
        </div>
      </section>

      <section className="pb-20 pt-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ShowtimeFilters theaters={theaters} comingSoonMovies={comingSoonMovies} />
        </div>
      </section>
    </div>
  );
}
