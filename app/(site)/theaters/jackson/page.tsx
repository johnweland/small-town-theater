import { notFound } from "next/navigation";
import Link from "next/link";
import { getTheaterWithShowtimes } from "@/lib/data";

export default async function JacksonTheaterPage() {
  const theater = await getTheaterWithShowtimes("jackson");
  if (!theater) notFound();

  return (
    <div className="bg-[#131313] text-[#e5e2e1]">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={theater.heroImage}
          alt={`${theater.name} exterior`}
          className="h-[480px] w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-7xl px-6 pb-16 lg:px-8">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#ffbf00]">
            {theater.district} · Est. {theater.established}
          </p>
          <h1 className="mt-3 font-serif text-6xl text-[#e5e2e1] lg:text-7xl">
            {theater.name}
          </h1>
          <p className="mt-3 font-sans text-sm text-[#d4c5ab]">
            {theater.address}
          </p>
        </div>
      </section>

      {/* ── About ── */}
      <section className="bg-[#1c1b1b] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl text-[#ffe2ab]">
                A Century of Stories
              </h2>
              {theater.descriptionParagraphs.map((p, i) => (
                <p
                  key={i}
                  className="mt-4 font-sans text-sm leading-7 text-[#d4c5ab]"
                >
                  {p}
                </p>
              ))}
            </div>
            <div className="space-y-0">
              {theater.specs.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between border-b border-[#504532]/30 py-4"
                >
                  <span className="font-sans text-xs uppercase tracking-wider text-[#9c8f78]">
                    {label}
                  </span>
                  <span className="font-sans text-sm text-[#d4c5ab] text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Concessions ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#9c8f78]">
            The Concession Stand
          </p>
          <h2 className="mt-3 font-serif text-3xl text-[#e5e2e1]">
            Classic Comforts
          </h2>
          <div className="mt-10 grid gap-0 sm:grid-cols-3">
            {theater.concessions.map((item) => (
              <div key={item.name} className="bg-[#1c1b1b] p-6">
                <p className="font-serif text-lg text-[#e5e2e1]">{item.name}</p>
                <p className="mt-1 font-sans text-2xl text-[#ffbf00]">
                  {item.price}
                </p>
                <p className="mt-1 font-sans text-xs text-[#9c8f78]">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Today's Showtimes ── */}
      <section className="bg-[#1c1b1b] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#9c8f78]">
            On Screen Now
          </p>
          <h2 className="mt-3 font-serif text-3xl text-[#e5e2e1]">
            Today&apos;s Programming
          </h2>
          <div className="mt-10 space-y-px">
            {theater.currentFilms.map((film) => (
              <article key={film.slug} className="bg-[#201f1f] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {film.isNew && (
                        <span className="rounded-[0.125rem] bg-[#a0030e] px-2 py-0.5 font-sans text-xs font-semibold uppercase tracking-wider text-[#ffa99f]">
                          New Release
                        </span>
                      )}
                      {film.badge && (
                        <span className="rounded-[0.125rem] bg-[#353534] px-2 py-0.5 font-sans text-xs font-semibold uppercase tracking-wider text-[#ffe2ab]">
                          {film.badge}
                        </span>
                      )}
                    </div>
                    <Link href={`/movie/${film.slug}`}>
                      <h3 className="font-serif text-xl text-[#e5e2e1] hover:text-[#ffe2ab] transition-colors">
                        {film.title}
                      </h3>
                    </Link>
                    <p className="mt-0.5 font-sans text-xs uppercase tracking-wider text-[#9c8f78]">
                      {film.rating} · {film.runtime}
                    </p>
                    <p className="mt-2 font-sans text-sm text-[#d4c5ab]">
                      {film.synopsis}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <p className="mb-2 font-sans text-xs text-[#9c8f78]">
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
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/showtimes"
              className="font-sans text-xs font-semibold uppercase tracking-wider text-[#ffe2ab] hover:text-[#ffbf00] transition-colors"
            >
              View Full Schedule →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Membership ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="bg-[#201f1f] p-10 lg:p-16">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#ffbf00]">
              Member Benefits
            </p>
            <h2 className="mt-3 font-serif text-3xl text-[#e5e2e1]">
              Join the Community
            </h2>
            <p className="mt-4 max-w-xl font-sans text-sm leading-6 text-[#d4c5ab]">
              {theater.memberBlurb}
            </p>
            <div className="mt-8 flex flex-wrap gap-8">
              {theater.memberBenefits.map((benefit) => (
                <p
                  key={benefit}
                  className="font-sans text-sm text-[#d4c5ab] before:mr-2 before:text-[#ffbf00] before:content-['✦']"
                >
                  {benefit}
                </p>
              ))}
            </div>
            <button className="mt-8 rounded-[0.125rem] bg-[#ffbf00] px-6 py-3 font-sans text-sm font-semibold uppercase tracking-widest text-[#402d00] transition-colors hover:bg-[#fbbc00]">
              Become a Member
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
