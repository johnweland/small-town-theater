import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getMovieDetail, getMovieShowtimes, getMovieSlugs } from "@/lib/data";
import { TrailerPlayer } from "@/components/site/trailer-player";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getMovieSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function MoviePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [movie, showtimes] = await Promise.all([
    getMovieDetail(slug),
    getMovieShowtimes(slug),
  ]);
  if (!movie) notFound();

  return (
    <div className="bg-[#131313] text-[#e5e2e1]">
      <section className="relative flex min-h-[52rem] items-end px-6 pt-24 lg:px-8">
        <div className="absolute inset-0">
          <Image
            src={movie.backdrop}
            alt={movie.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#131313]/80 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-end gap-8 pb-12 md:grid-cols-12">
          <div className="hidden md:col-span-4 md:-mb-24 md:block lg:col-span-3">
            <div className="origin-bottom -rotate-1 bg-[#1c1b1b] p-1 shadow-[0_24px_48px_rgba(0,0,0,0.45)]">
              <div className="relative aspect-[2/3] w-full bg-[#131313]">
                <Image
                  src={movie.poster}
                  alt={`${movie.title} poster`}
                  fill
                  sizes="(max-width: 1024px) 33vw, 25vw"
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 md:col-span-8 lg:col-span-9">
            <div className="flex flex-wrap items-center gap-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#ffe2ab]">
              <span className="bg-[#a0030e] px-3 py-1 text-[#ffa99f]">
                {movie.status === "now-playing" ? "Now Playing" : "Coming Soon"}
              </span>
              <span>{movie.runtime}</span>
              <span>{movie.rating}</span>
            </div>
            <h1 className="font-serif text-6xl italic leading-none text-[#e5e2e1] md:text-8xl lg:text-9xl">
              {movie.title}
            </h1>
            <p className="max-w-2xl font-sans text-lg italic leading-8 text-[#d4c5ab]">
              &ldquo;{movie.tagline}&rdquo;
            </p>
            <div className="flex flex-wrap gap-8 pt-2">
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#9c8f78]">
                  Director
                </p>
                <p className="mt-1 font-serif text-xl text-[#ffe2ab]">
                  {movie.director}
                </p>
              </div>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#9c8f78]">
                  Starring
                </p>
                <p className="mt-1 font-serif text-xl text-[#e5e2e1]">
                  {movie.cast.join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-32 grid max-w-7xl gap-16 px-6 lg:grid-cols-12 lg:px-8">
        <div className="space-y-8 lg:col-span-7">
          <h2 className="border-l-2 border-[#ffbf00] pl-6 font-serif text-4xl italic text-[#e5e2e1]">
            Synopsis
          </h2>
          <p className="max-w-2xl font-sans text-lg leading-8 text-[#d4c5ab]">
            {movie.synopsis}
          </p>
          <div className="grid gap-4 pt-4 sm:grid-cols-3">
            <div className="bg-[#1c1b1b] p-6">
              <p className="mb-2 font-sans text-[10px] uppercase tracking-[0.2em] text-[#9c8f78]">
                Release Date
              </p>
              <p className="font-sans text-sm font-semibold text-[#e5e2e1]">
                {movie.releaseDate ?? "TBD"}
              </p>
            </div>
            <div className="bg-[#1c1b1b] p-6">
              <p className="mb-2 font-sans text-[10px] uppercase tracking-[0.2em] text-[#9c8f78]">
                Audience Score
              </p>
              <p className="font-sans text-sm font-semibold text-[#e5e2e1]">
                {movie.audienceScore ?? movie.score}
              </p>
            </div>
            <div className="bg-[#1c1b1b] p-6">
              <p className="mb-2 font-sans text-[10px] uppercase tracking-[0.2em] text-[#9c8f78]">
                Studios
              </p>
              <p className="font-sans text-sm font-semibold text-[#e5e2e1]">
                {(movie.productionCompanies ?? [movie.production]).join(", ")}
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-[#1c1b1b] p-6">
              <p className="mb-2 font-sans text-[10px] uppercase tracking-[0.2em] text-[#9c8f78]">
                Genre
              </p>
              <p className="font-sans text-sm font-semibold text-[#e5e2e1]">
                {movie.genre}
              </p>
            </div>
            <div className="bg-[#1c1b1b] p-6">
              <p className="mb-2 font-sans text-[10px] uppercase tracking-[0.2em] text-[#9c8f78]">
                Original Language
              </p>
              <p className="font-sans text-sm font-semibold text-[#e5e2e1]">
                {movie.originalLanguage ?? "English"}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <TrailerPlayer
            title={movie.title}
            backdrop={movie.backdrop}
            trailerYouTubeId={movie.trailerYouTubeId}
          />
        </div>
      </section>

      {showtimes.length > 0 && (
        <section className="mx-auto mt-32 max-w-7xl space-y-16 px-6 pb-20 lg:px-8">
          <div className="flex flex-col gap-6 border-b border-[#504532]/20 pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-serif text-5xl text-[#e5e2e1]">
                Book Your Seat
              </h2>
              <p className="mt-3 font-sans text-sm uppercase tracking-[0.2em] text-[#9c8f78]">
                Choose a theater and time
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="bg-[#ffbf00] px-6 py-3 font-sans text-sm font-semibold text-[#402d00]">
                Today
              </button>
              <button className="bg-[#2a2a2a] px-6 py-3 font-sans text-sm font-semibold text-[#9c8f78] transition-colors hover:text-[#e5e2e1]">
                Tomorrow
              </button>
              <button className="bg-[#2a2a2a] px-6 py-3 font-sans text-sm font-semibold text-[#9c8f78] transition-colors hover:text-[#e5e2e1]">
                Weekend
              </button>
            </div>
          </div>

          <div className="grid gap-12 xl:grid-cols-2">
            {showtimes.map((showtime) => (
              <div key={showtime.bookingId} className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="font-sans text-xl text-[#ffbf00]">
                    {showtime.badge ? "◉" : "◌"}
                  </span>
                  <div>
                    <Link href={`/theaters/${showtime.theaterId}`}>
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
                  {showtime.times.map((time) => (
                    <div
                      key={time}
                      className="flex min-h-[160px] flex-col justify-between bg-[#1c1b1b] p-8 transition-colors hover:bg-[#2a2a2a]"
                    >
                      <div>
                        <p className="font-sans text-3xl font-bold text-[#ffe2ab]">
                          {time}
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
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
