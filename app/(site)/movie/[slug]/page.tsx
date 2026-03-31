import { notFound } from "next/navigation";
import Link from "next/link";
import { getMovieWithShowtimes, getMovieSlugs } from "@/lib/data";

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
  const movie = await getMovieWithShowtimes(slug);
  if (!movie) notFound();

  return (
    <div className="bg-[#131313] text-[#e5e2e1]">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#131313] via-[#131313]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-36">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-16">
            {/* Poster */}
            <div className="shrink-0 hidden lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={movie.poster}
                alt={`${movie.title} poster`}
                className="h-80 w-52 rounded-[0.125rem] object-cover shadow-[0px_20px_40px_rgba(0,0,0,0.4)]"
              />
            </div>

            {/* Title block */}
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#ffbf00]">
                Now Showing
              </p>
              <h1 className="mt-4 font-serif text-5xl leading-tight text-[#e5e2e1] lg:text-7xl">
                {movie.title}
              </h1>
              <p className="mt-3 font-sans text-base italic text-[#d4c5ab]">
                &ldquo;{movie.tagline}&rdquo;
              </p>
              <p className="mt-4 font-sans text-xs uppercase tracking-wider text-[#9c8f78]">
                {movie.rating} · {movie.runtime} · Dir. {movie.director}
              </p>
              <p className="mt-2 font-sans text-xs text-[#9c8f78]">
                Cast:{" "}
                <span className="text-[#d4c5ab]">{movie.cast.join(", ")}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Synopsis ── */}
      <section className="bg-[#1c1b1b] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl text-[#ffe2ab]">Synopsis</h2>
              <p className="mt-4 font-sans text-base leading-7 text-[#d4c5ab]">
                {movie.synopsis}
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-[#ffe2ab]">Credits</h2>
              <dl className="space-y-3 font-sans text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-[#9c8f78]">
                    Director
                  </dt>
                  <dd className="mt-0.5 text-[#d4c5ab]">{movie.director}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-[#9c8f78]">
                    Cinematography
                  </dt>
                  <dd className="mt-0.5 text-[#d4c5ab]">{movie.cinematography}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-[#9c8f78]">
                    Original Score
                  </dt>
                  <dd className="mt-0.5 text-[#d4c5ab]">{movie.score}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-[#9c8f78]">
                    Production
                  </dt>
                  <dd className="mt-0.5 text-[#d4c5ab]">{movie.production}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ── Showtimes ── */}
      {movie.showtimes.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="font-serif text-3xl text-[#e5e2e1]">Showtimes</h2>
            <p className="mt-2 font-sans text-xs uppercase tracking-wider text-[#9c8f78]">
              Select a time to purchase tickets
            </p>

            <div className="mt-10 grid gap-0 lg:grid-cols-2">
              {movie.showtimes.map((s) => (
                <div key={s.theaterId} className="bg-[#1c1b1b] p-8">
                  {s.badge && (
                    <span className="mb-3 inline-block rounded-[0.125rem] bg-[#353534] px-2 py-0.5 font-sans text-xs font-semibold uppercase tracking-wider text-[#ffe2ab]">
                      {s.badge}
                    </span>
                  )}
                  <Link href={`/theaters/${s.theaterId}`}>
                    <h3 className="font-serif text-2xl text-[#ffe2ab] hover:text-[#ffbf00] transition-colors">
                      {s.theaterName}
                    </h3>
                  </Link>
                  <p className="mt-1 font-sans text-xs text-[#9c8f78]">
                    {s.price} per ticket
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {s.times.map((time) => (
                      <button
                        key={time}
                        className="rounded-[0.125rem] bg-[#ffbf00] px-5 py-2.5 font-sans text-sm font-semibold text-[#402d00] transition-colors hover:bg-[#fbbc00]"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
