import Link from "next/link";

import { getTheaters } from "@/lib/data";

export async function SiteNav() {
  const theaters = await getTheaters();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#131313]/80 border-b border-[#504532]/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <nav className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-xl font-normal tracking-tight text-[#ffe2ab] shrink-0"
          >
            Small Town Theater
          </Link>

          {/* Primary links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-sans text-[#d4c5ab]">
            {theaters.map((theater) => (
              <Link
                key={theater.slug}
                href={`/theaters/${theater.slug}`}
                className="hover:text-[#ffe2ab] transition-colors"
              >
                {theater.city}
              </Link>
            ))}
            <Link
              href="/showtimes"
              className="hover:text-[#ffe2ab] transition-colors"
            >
              Now Playing
            </Link>
            <Link
              href="/events"
              className="hover:text-[#ffe2ab] transition-colors"
            >
              Events
            </Link>
            <Link
              href="/about"
              className="hover:text-[#ffe2ab] transition-colors"
            >
              About
            </Link>
          </div>

          {/* CTA */}
          <Link
            href="/showtimes"
            className="shrink-0 rounded-[0.125rem] bg-[#ffbf00] px-4 py-2 text-xs font-sans font-semibold uppercase tracking-widest text-[#402d00] transition-colors hover:bg-[#fbbc00]"
          >
            Buy Tickets
          </Link>
        </nav>
      </div>
    </header>
  );
}
