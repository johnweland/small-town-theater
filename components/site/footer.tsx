import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-[#0e0e0e] mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div>
            <p className="font-serif text-lg text-[#ffe2ab]">
              Small Town Theater
            </p>
            <p className="mt-1 text-xs font-sans text-[#d4c5ab]">
              Jackson Theater &amp; Sherburn Theater
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-sans text-[#d4c5ab]">
            <Link href="/about" className="hover:text-[#ffe2ab] transition-colors">
              About Us
            </Link>
            <Link href="/theaters/jackson" className="hover:text-[#ffe2ab] transition-colors">
              Jackson Theater
            </Link>
            <Link href="/theaters/sherburn" className="hover:text-[#ffe2ab] transition-colors">
              Sherburn Theater
            </Link>
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
          © {new Date().getFullYear()} Small Town Theater. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
