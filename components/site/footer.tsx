import Link from "next/link";

import { getTheaters } from "@/lib/data";
import { APP_NAME } from "@/lib/config";

export async function SiteFooter() {
  const theaters = await getTheaters();

  return (
    <footer className="bg-[#0e0e0e] mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div>
            <p className="font-serif text-lg text-[#ffe2ab]">
              {APP_NAME}
            </p>
            <p className="mt-1 text-xs font-sans text-[#d4c5ab]">
              {theaters.map((theater) => theater.name).join(" · ")}
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-sans text-[#d4c5ab]">
            <Link href="/about" className="hover:text-[#ffe2ab] transition-colors">
              About Us
            </Link>
            {theaters.map((theater) => (
              <Link
                key={theater.slug}
                href={`/theaters/${theater.slug}`}
                className="hover:text-[#ffe2ab] transition-colors"
              >
                {theater.name}
              </Link>
            ))}
            <Link href="/showtimes" className="hover:text-[#ffe2ab] transition-colors">
              Showtimes
            </Link>
            <Link href="#" className="hover:text-[#ffe2ab] transition-colors">
              Contact
            </Link>
            <Link href="#" className="hover:text-[#ffe2ab] transition-colors">
              Privacy Policy
            </Link>
          </nav>
        </div>

        <p className="mt-8 border-t border-[#504532]/40 pt-6 text-xs font-sans text-[#9c8f78]">
          © {new Date().getFullYear()} {APP_NAME}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
