import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-[#131313] text-[#e5e2e1]">
      {/* ── Heritage Hero ── */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAy7wTTRWdKX06azNrcRWSZJAl0hRMQ7Pv-KWraTaW3rvxcUm2QXaH51yz6usWAgoPAXx_cFhTU-3fTUB5KA9PQkIygxdYLsD2V6JfYkyXSWDt2Nq5fGzO4g6iZCc4ZwN8VdvD6y7Cs2qpZDYiwnRqhx0Vnk3kM3ygXNjo2GwrOZnNH6sIip3aFAMmMZJ8dwHNcqjITtIlqYayWcU9TZWCeB04ynKOmCxuoKffXkL-si_EIzswTaqmjHBn8WzTNByDRa3SqeFN8FUw"
          alt="Vintage cinema interior"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#131313]" />
        <div className="relative mx-auto max-w-7xl px-6 py-32 lg:px-8 lg:py-44">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#ffbf00]">
            Est. 1924
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-6xl leading-tight text-[#e5e2e1] lg:text-8xl">
            Saving Local Cinema.
          </h1>
          <p className="mt-6 max-w-xl font-sans text-base leading-7 text-[#d4c5ab]">
            In an era of endless scrolling, we choose the collective experience.
            Small Town Theater is more than a theater network—it is a movement
            to preserve the magic of the silver screen in the heart of our
            neighborhoods.
          </p>
        </div>
      </section>

      {/* ── Our Heritage ── */}
      <section className="bg-[#1c1b1b] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#9c8f78]">
                Our Heritage
              </p>
              <h2 className="mt-3 font-serif text-4xl text-[#e5e2e1]">
                A Century of Stories
              </h2>
              <p className="mt-6 font-sans text-sm leading-7 text-[#d4c5ab]">
                From the silent film era to the digital revolution, our theaters
                have stood as landmarks of culture. We believe these spaces are
                the soul of the community—where first dates happen and lifelong
                memories are forged.
              </p>

              <div className="mt-8">
                <h3 className="font-serif text-xl text-[#ffe2ab]">
                  The Preservation Era
                </h3>
                <p className="mt-3 font-sans text-sm leading-7 text-[#d4c5ab]">
                  In 2012, when the Jackson Theater faced demolition, a group of
                  local residents launched a grassroots campaign that changed
                  everything. We didn&apos;t just save a building; we saved a
                  way of life. Today, both theaters stand fully restored—living
                  proof that communities can protect what matters.
                </p>
              </div>
            </div>

            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG0sXbViJlVpVlmKy84HL42-glCnVH_SxnzuI464PTVRbdeM7iQ0-jgsg9XKfjCO8AvCMnSOa2ESaEWp0OkaF3lLGnnC5h_NzmkrORB53HsBottFZNz7DsZuRfV-V_MtWoWU-GTBzRcRbC3Ee1mvnfMoGc4WyJ4kCUVaF3TQzzDW_lJiuBTWL_UPGkAw9y5ZxaL7KIeQmuGQIbQbLRohz2FBXkvz8UDGzTaO_XuijLBsWxPzGeGgT8PQ5jq9Hz3L4igHRCTkEA2xs"
                alt="Vintage film reel"
                className="w-full rounded-[0.125rem] object-cover"
              />
              <div className="mt-4 flex items-center gap-4">
                <div>
                  <p className="font-serif text-4xl text-[#ffbf00]">98%</p>
                  <p className="font-sans text-xs uppercase tracking-wider text-[#9c8f78]">
                    Community Funded Restorations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Community Events ── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#9c8f78]">
            Community
          </p>
          <h2 className="mt-3 font-serif text-4xl text-[#e5e2e1]">
            More Than Just Movies
          </h2>
          <p className="mt-4 max-w-xl font-sans text-sm leading-6 text-[#d4c5ab]">
            We host weekly events designed to bring neighbors together. From
            local filmmaker showcases to midnight cult classics, there is always
            a seat for you.
          </p>
          <Link
            href="/showtimes"
            className="mt-4 inline-block font-sans text-xs font-semibold uppercase tracking-wider text-[#ffe2ab] hover:text-[#ffbf00] transition-colors"
          >
            View Calendar →
          </Link>

          <div className="mt-12 grid gap-0 lg:grid-cols-3">
            {[
              {
                title: "Director's Roundtables",
                description:
                  "Monthly Q&A sessions with regional independent filmmakers and student creators.",
                image:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCHNtHueLQZkvBm1fEr6-ZJsAHTqwDsbweFEoO84E73iRI5F6sUGK4C4oJO5RyH83-pK9h2gIkhaOk9Aeu52FH8dry8K6DRfR5aAv9Fs01341h74U2nczrpb7WZGvKeWBU9LTevhJ6TXrgbnwhKiznrlvvVpn4bFiC6ETmS_Wk_4AWBwaIyCGkJZR4FRkhZsodRhtYxBeR7NHEhg66JXsq3SJCBMlzkByrlPrFnTcqXykrwpczzBhlbJFFqcHYL7_mA9jEDtqKA",
              },
              {
                title: "Moonlight Screenings",
                description:
                  "Free community screenings in the park during the summer months.",
                image:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuB62nmJ5V8m4M-0jNafFcMq1UhtCD0tbZZPtyc3IBBpfCLnEYqM5dt7duvMMZ6ce0AwcIFRwG1Mmx6AcHQ_AQrXO_5-XD8AP_WIBFpxTjXvQ3DKj6m4Om9rrcAFmRxpd7peeUZWl3J09kTI0X_MyogP9tjt0GZICqCIffSgwkXHc4mXMR5lq6lM-cNu1--uUk0CsdpHsfZ421kE2APpNZKwpbY2PbwYgNsNsq4U92a56Sj572CtwT8ifKTC-uOQFJSXv2FwqXLZ4DM",
              },
              {
                title: "The Archive Series",
                description:
                  "Restored 35mm prints of historical masterpieces shown as they were meant to be seen.",
                image:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDYOioEUq9e_ATSef9lQkHHot1hv6ky1Bo0tIK9GtlfPwHLXyKAzYPEGsKeOJ6pUdqxxm_20CR0aWu4ZaDbK2Rdi-X6sManLKz42VUaNdNqJB-B9vZDugGm4mp-VGhA34_VYuk2GoKi79N94McadRIefMUNF5VPcuncs0v9MUYptzIULLXTHj8h6NsaTO7L2dDbmazdeMkgy6y4AIp9GM9LfxRUKchyu3jhh9pLCnk__9bFiliRHLuDdvpcmF4IvxjwlVSPGEAXB1U",
              },
            ].map((event) => (
              <article key={event.title} className="bg-[#1c1b1b]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="font-serif text-xl text-[#e5e2e1]">
                    {event.title}
                  </h3>
                  <p className="mt-3 font-sans text-sm leading-6 text-[#d4c5ab]">
                    {event.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Network ── */}
      <section className="bg-[#1c1b1b] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#9c8f78]">
            The Network
          </p>
          <h2 className="mt-3 font-serif text-4xl text-[#e5e2e1]">
            Visit Our Houses
          </h2>

          <div className="mt-12 grid gap-0 lg:grid-cols-2">
            {/* Jackson */}
            <div className="bg-[#201f1f]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoDKlDYpeVPNziGWRArXpb91dpx9319A84alSsuRftSjoR5aA7fi27ZKs6ockIvmyL6G1XbyB84C8DSh0CTLjbP6Fgo1dHcmy4tWpXZPeZtv2bFkYIOJPUCxpW2xhl3Gz211IKxZiFHNAK3lYjJaw3vOi4AgvE0rcvYP-Q9JEpRy2gut3AGohOZ7SSeFm8rLzBKCJSp2QfJo6xx_gPHRZm33uP13JvsOVFv16QPGf5ln350DX-aREK0SZfh9ogPet_sZCd_v9_ZtU"
                alt="Jackson Theater"
                className="h-52 w-full object-cover opacity-60"
              />
              <div className="p-8">
                <h3 className="font-serif text-2xl text-[#ffe2ab]">
                  Jackson Theater
                </h3>
                <p className="mt-1 font-sans text-xs uppercase tracking-wider text-[#9c8f78]">
                  Downtown Historic District
                </p>
                <ul className="mt-4 space-y-1 font-sans text-sm text-[#d4c5ab]">
                  <li>1 Screen · Classic Projection</li>
                  <li>Historic Concessions Stand</li>
                  <li>Original Velvet Seating</li>
                </ul>
                <Link
                  href="/theaters/jackson"
                  className="mt-6 inline-flex items-center gap-1 font-sans text-xs font-semibold uppercase tracking-wider text-[#ffe2ab] hover:text-[#ffbf00] transition-colors"
                >
                  Directions →
                </Link>
              </div>
            </div>

            {/* Sherburn */}
            <div className="bg-[#2a2a2a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1MXrFdHN_TIqWls3zgPPjs_y9M8RjFN5N1yedYoabe3kdq8hrIC8ttzRjJ32cPm86CPXQMLYyZ8-Q6Ub4qVw83XLJacWH-FH4mdu26x0EjZhDxfpPiobDltNnneWq0siDmUx7aq43IjktLI_PjKsEEOhKlT9kW7M9AzGkn4sg0ozvOzgPxPSqTutn9EzWY1e3a8Ua5GncbVKvLNfUwmIP2tuha-LTfQKZDHOWbtJeNs7960MapSYARdNW-FZ8VnlUHoARwBamXM"
                alt="Sherburn Theater"
                className="h-52 w-full object-cover opacity-60"
              />
              <div className="p-8">
                <h3 className="font-serif text-2xl text-[#ffe2ab]">
                  Sherburn Theater
                </h3>
                <p className="mt-1 font-sans text-xs uppercase tracking-wider text-[#9c8f78]">
                  Eastside Arts Village
                </p>
                <ul className="mt-4 space-y-1 font-sans text-sm text-[#d4c5ab]">
                  <li>1 Screen · 70mm Capable</li>
                  <li>Artisan Coffee Bar</li>
                  <li>Outdoor Courtyard</li>
                </ul>
                <Link
                  href="/theaters/sherburn"
                  className="mt-6 inline-flex items-center gap-1 font-sans text-xs font-semibold uppercase tracking-wider text-[#ffe2ab] hover:text-[#ffbf00] transition-colors"
                >
                  Directions →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
