import Image from "next/image";
import Link from "next/link";
import type { MembershipProgram, TheaterWithShowtimes } from "@/lib/data";

const theaterLinks = {
  jackson: {
    current: "Jackson Theater",
    otherHref: "/theaters/sherburn",
    otherLabel: "Sherburn Theater",
  },
  sherburn: {
    current: "Sherburn Theater",
    otherHref: "/theaters/jackson",
    otherLabel: "Jackson Theater",
  },
} as const;

export function TheaterView({
  theater,
  membership,
}: {
  theater: TheaterWithShowtimes;
  membership: MembershipProgram | null;
}) {
  const linkSet =
    theaterLinks[theater.id as keyof typeof theaterLinks] ?? theaterLinks.jackson;
  const featuredBooking = theater.currentBookings[0] ?? null;

  return (
    <div className="bg-[#131313] text-[#e5e2e1]">
      <section className="relative flex min-h-[44rem] items-end overflow-hidden px-6 pb-16 pt-24 lg:px-8 lg:pb-20">
        <div className="absolute inset-0">
          <Image
            src={theater.heroImage}
            alt={`${theater.name} exterior`}
            fill
            priority
            sizes="100vw"
            className="object-cover grayscale opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/65 to-[#131313]/15" />
        </div>

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.3em] text-[#ffe2ab]">
              <span>Est. {theater.established}</span>
              <span className="h-px w-12 bg-[#ffe2ab]/40" />
              <span>{theater.district}</span>
            </div>
            <h1 className="mt-6 font-serif text-6xl italic leading-none text-[#e5e2e1] md:text-7xl lg:text-8xl">
              {theater.name}
            </h1>
            <p className="mt-5 max-w-2xl font-serif text-2xl text-[#ffe2ab] md:text-3xl">
              {theater.descriptionParagraphs[0]}
            </p>
          </div>

          <div className="w-full max-w-sm bg-[#1c1b1b]/80 p-6 backdrop-blur-md">
            <p className="font-sans text-xs uppercase tracking-[0.25em] text-[#9c8f78]">
              Theater Guide
            </p>
            <div className="mt-4 flex flex-wrap gap-3 font-sans text-xs uppercase tracking-[0.2em]">
              <span className="border-b border-[#ffbf00] pb-1 text-[#ffbf00]">
                {linkSet.current}
              </span>
              <Link
                href={linkSet.otherHref}
                className="text-[#d4c5ab] transition-colors hover:text-[#ffe2ab]"
              >
                {linkSet.otherLabel}
              </Link>
              <Link
                href="/showtimes"
                className="text-[#d4c5ab] transition-colors hover:text-[#ffe2ab]"
              >
                Now Playing
              </Link>
              <Link
                href="/about"
                className="text-[#d4c5ab] transition-colors hover:text-[#ffe2ab]"
              >
                About
              </Link>
            </div>
            <p className="mt-6 font-sans text-sm leading-7 text-[#d4c5ab]">
              {theater.address}
            </p>
            <Link
              href="/showtimes"
              className="mt-6 inline-flex rounded-[0.125rem] bg-[#ffbf00] px-5 py-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#402d00] transition-colors hover:bg-[#fbbc00]"
            >
              Find Showtimes
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-12">
          <article className="bg-[#1c1b1b] p-8 lg:col-span-7 lg:p-10">
            <p className="font-sans text-xs uppercase tracking-[0.25em] text-[#9c8f78]">
              Find Us On Main
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[#e5e2e1]">
              {theater.address}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {theater.specs.map((spec) => (
                <div key={spec.label} className="bg-[#2a2a2a] p-5">
                  <p className="font-sans text-[0.7rem] uppercase tracking-[0.25em] text-[#9c8f78]">
                    {spec.label}
                  </p>
                  <p className="mt-2 font-sans text-sm leading-6 text-[#d4c5ab]">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 max-w-2xl font-sans text-sm leading-7 text-[#d4c5ab]">
              {theater.descriptionParagraphs[1]}
            </p>
          </article>

          <article className="border-l-4 border-[#a0030e] bg-[#a0030e]/10 p-8 lg:col-span-5 lg:p-10">
            <p className="font-sans text-xs uppercase tracking-[0.25em] text-[#ffa99f]">
              The Concession Stand
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[#ffb4ab]">
              House Favorites
            </h2>
            <div className="mt-8 space-y-8">
              {theater.concessions.map((item) => (
                <div key={item.name} className="flex items-start justify-between gap-6">
                  <div>
                    <p className="font-serif text-xl text-[#e5e2e1]">{item.name}</p>
                    <p className="mt-2 font-sans text-sm leading-6 text-[#d4c5ab]">
                      {item.note}
                    </p>
                  </div>
                  <p className="shrink-0 font-sans text-sm font-semibold text-[#ffe2ab]">
                    {item.price}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-10 border-t border-[#ffb4ab]/20 pt-8">
              <p className="font-sans text-xs uppercase tracking-[0.25em] text-[#ffa99f]">
                Membership Perk
              </p>
              <p className="mt-3 font-sans text-sm italic leading-6 text-[#e5e2e1]">
                {membership?.benefits[2] ??
                  membership?.blurb ??
                  "Membership perks apply across every Small Town Theater location."}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-[#0e0e0e] px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.25em] text-[#9c8f78]">
                On Screen Now
              </p>
              <h2 className="mt-4 font-serif text-5xl italic text-[#e5e2e1] md:text-6xl">
                Theater View
              </h2>
              <p className="mt-3 font-sans text-sm text-[#9c8f78]">
                Curated showtimes for {theater.name}.
              </p>
            </div>
            <Link
              href="/showtimes"
              className="inline-flex items-center justify-center border border-[#9c8f78] px-6 py-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#e5e2e1] transition-colors hover:bg-[#e5e2e1] hover:text-[#131313]"
            >
              View Full Schedule
            </Link>
          </div>

          <div className="mt-16 space-y-16">
            {theater.currentBookings.map((booking, index) => {
              const isFeatured = featuredBooking?.bookingId === booking.bookingId;

              return (
                <article
                  key={booking.bookingId}
                  className={`grid gap-10 md:grid-cols-12 ${index > 0 ? "border-t border-[#504532]/15 pt-16" : ""}`}
                >
                  <div className="md:col-span-3">
                    <div className="relative aspect-[2/3] overflow-hidden bg-[#201f1f] shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                      <Image
                        src={booking.poster}
                        alt={booking.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-9">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      {booking.badge ? (
                        <span className="bg-[#a0030e] px-2 py-1 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#ffa99f]">
                          {booking.badge}
                        </span>
                      ) : null}
                      {booking.isNew ? (
                        <span className="bg-[#353534] px-2 py-1 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#ffe2ab]">
                          New Release
                        </span>
                      ) : null}
                      <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#9c8f78]">
                        {booking.rating} · {booking.runtime}
                      </span>
                      <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#9c8f78]">
                        {booking.screenName}
                      </span>
                    </div>

                    <h3 className="font-serif text-5xl text-[#e5e2e1] md:text-6xl">{booking.title}</h3>
                    <p className="mt-6 max-w-2xl font-sans text-lg leading-8 text-[#d4c5ab]">
                      {booking.synopsis}
                    </p>
                    <p className="mt-4 font-sans text-xs uppercase tracking-[0.2em] text-[#9c8f78]">
                      Runs {booking.runStartsOn} through {booking.runEndsOn}
                    </p>

                    <div className="mt-10 flex flex-wrap gap-4">
                      {booking.times.map((time, timeIndex) => (
                        <button
                          key={time}
                          className={`px-6 py-3 font-sans text-sm font-semibold transition-colors ${
                            isFeatured && timeIndex === booking.times.length - 1
                              ? "bg-[#ffbf00] text-[#402d00] shadow-[0_20px_40px_rgba(251,188,0,0.15)]"
                              : "bg-[#2a2a2a] text-[#e5e2e1] hover:bg-[#ffbf00] hover:text-[#402d00]"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-6">
                      <Link
                        href={`/movie/${booking.slug}`}
                        className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#ffe2ab] transition-colors hover:text-[#ffbf00]"
                      >
                        View Film Details
                      </Link>
                      <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#9c8f78]">
                        Tickets {booking.price}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-24 text-center lg:px-8">
        <div className="absolute inset-0">
          <Image
            src={theater.heroImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover grayscale opacity-20"
          />
          <div className="absolute inset-0 bg-[#131313]/85" />
        </div>
        <div className="relative mx-auto max-w-4xl">
          <h2 className="font-serif text-5xl italic text-[#e5e2e1] md:text-7xl">
            Experience the Glow.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-sm uppercase tracking-[0.25em] text-[#9c8f78]">
            {membership?.benefits.join(" · ") ??
              "Early access · Ticket perks · Concession benefits · Special events"}
          </p>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-base leading-7 text-[#d4c5ab]">
            {membership?.blurb}
          </p>
          <Link
            href={membership?.ctaHref ?? "/about"}
            className="mt-10 inline-flex rounded-[0.125rem] bg-[#ffbf00] px-8 py-4 font-sans text-sm font-semibold uppercase tracking-[0.25em] text-[#402d00] transition-transform hover:scale-[1.02]"
          >
            {membership?.ctaLabel ?? "Become a Member"}
          </Link>
        </div>
      </section>
    </div>
  );
}
