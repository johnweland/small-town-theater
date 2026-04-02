import Link from "next/link";
import Image from "next/image";

import type { Movie } from "@/lib/data";

export function ComingSoonList({
  title,
  description,
  movies,
}: {
  title: string;
  description: string;
  movies: Movie[];
}) {
  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8">
      <div>
        <p className="font-sans text-xs uppercase tracking-[0.25em] text-[#9c8f78]">
          Coming Soon
        </p>
        <h3 className="mt-4 font-serif text-4xl italic text-[#e5e2e1]">{title}</h3>
        <p className="mt-3 max-w-2xl font-sans text-sm text-[#9c8f78]">{description}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {movies.map((movie) => (
          <article key={movie.slug} className="overflow-hidden bg-[#1c1b1b]">
            <div className="relative aspect-[2/3] bg-[#201f1f]">
              <Image
                src={movie.poster}
                alt={movie.title}
                fill
                sizes="(max-width: 1280px) 50vw, 33vw"
                className="object-cover opacity-80"
              />
            </div>
            <div className="space-y-3 p-6">
              <span className="inline-flex bg-[#353534] px-2 py-1 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#ffe2ab]">
                Coming Soon
              </span>
              <h4 className="font-serif text-2xl text-[#e5e2e1]">{movie.title}</h4>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#9c8f78]">
                {movie.rating} · {movie.runtime}
              </p>
              <p className="line-clamp-3 font-sans text-sm leading-7 text-[#d4c5ab]">
                {movie.tagline}
              </p>
              <Link
                href={`/movie/${movie.slug}`}
                className="inline-flex font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#ffe2ab] transition-colors hover:text-[#ffbf00]"
              >
                View Film Details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
