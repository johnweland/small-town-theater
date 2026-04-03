/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { getEvents } from "@/lib/data";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="bg-[#131313] text-[#e5e2e1]">
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#ffbf00]">
              Community Events
            </p>
            <h1 className="mt-4 font-serif text-5xl text-[#e5e2e1] md:text-7xl">
              Gather at the marquee
            </h1>
            <p className="mt-6 font-sans text-base leading-7 text-[#d4c5ab]">
              Special screenings, neighborhood fundraisers, filmmaker conversations,
              and local nights that keep our houses connected to the people around them.
            </p>
          </div>
          <Link
            href="/about"
            className="inline-flex border-b border-[#ffbf00] pb-1 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-[#ffbf00] transition-colors hover:border-[#ffe2ab] hover:text-[#ffe2ab]"
          >
            About the theaters
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="mt-16 bg-[#1c1b1b] p-10">
            <h2 className="font-serif text-3xl text-[#e5e2e1]">No upcoming events yet</h2>
            <p className="mt-4 max-w-xl font-sans leading-7 text-[#d4c5ab]">
              Check back soon for community programming, special series, and one-night events.
            </p>
          </div>
        ) : (
          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {events.map((event) => (
              <article key={event.id} className="overflow-hidden bg-[#1c1b1b]">
                <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="aspect-[4/5] overflow-hidden bg-[#201f1f]">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-between p-8">
                    <div>
                      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#ffbf00]">
                        {event.theaterName}
                      </p>
                      <h2 className="mt-4 font-serif text-3xl italic text-[#e5e2e1]">
                        {event.title}
                      </h2>
                      <p className="mt-4 font-sans text-sm leading-7 text-[#d4c5ab]">
                        {event.description || event.summary}
                      </p>
                    </div>
                    <div className="mt-8 border-t border-[#504532]/30 pt-6">
                      <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#9c8f78]">
                        Starts {event.startsAtLabel}
                      </p>
                      <p className="mt-2 font-sans text-xs uppercase tracking-[0.2em] text-[#9c8f78]">
                        Ends {event.endsAtLabel}
                      </p>
                      {event.theaterSlug ? (
                        <Link
                          href={`/theaters/${event.theaterSlug}`}
                          className="mt-6 inline-flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-[#ffe2ab] transition-colors hover:text-[#ffbf00]"
                        >
                          Visit theater
                          <span aria-hidden="true">→</span>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
