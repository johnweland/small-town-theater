import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  const events = [
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
  ];

  const theaters = [
    {
      title: "Jackson Theater",
      district: "Downtown Historic District",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBoDKlDYpeVPNziGWRArXpb91dpx9319A84alSsuRftSjoR5aA7fi27ZKs6ockIvmyL6G1XbyB84C8DSh0CTLjbP6Fgo1dHcmy4tWpXZPeZtv2bFkYIOJPUCxpW2xhl3Gz211IKxZiFHNAK3lYjJaw3vOi4AgvE0rcvYP-Q9JEpRy2gut3AGohOZ7SSeFm8rLzBKCJSp2QfJo6xx_gPHRZm33uP13JvsOVFv16QPGf5ln350DX-aREK0SZfh9ogPet_sZCd_v9_ZtU",
      highlights: [
        "1 Screen | Classic Projection",
        "Historic Concessions Stand",
        "Original Velvet Seating",
      ],
      href: "/theaters/jackson-theater",
    },
    {
      title: "Sherburn Theater",
      district: "Eastside Arts Village",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA1MXrFdHN_TIqWls3zgPPjs_y9M8RjFN5N1yedYoabe3kdq8hrIC8ttzRjJ32cPm86CPXQMLYyZ8-Q6Ub4qVw83XLJacWH-FH4mdu26x0EjZhDxfpPiobDltNnneWq0siDmUx7aq43IjktLI_PjKsEEOhKlT9kW7M9AzGkn4sg0ozvOzgPxPSqTutn9EzWY1e3a8Ua5GncbVKvLNfUwmIP2tuha-LTfQKZDHOWbtJeNs7960MapSYARdNW-FZ8VnlUHoARwBamXM",
      highlights: [
        "1 Screen | 70mm Capable",
        "Artisan Coffee Bar",
        "Outdoor Courtyard",
      ],
      href: "/theaters/sherburn-theater",
    },
  ];

  return (
    <div className="bg-[#131313] text-[#e5e2e1]">
      <section className="mx-auto mb-32 max-w-7xl px-6 pt-32 lg:px-8">
        <div className="flex flex-col items-end gap-12 lg:flex-row">
          <div className="relative w-full lg:w-3/5">
            <div className="relative aspect-[16/9] overflow-hidden bg-[#1c1b1b]">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAy7wTTRWdKX06azNrcRWSZJAl0hRMQ7Pv-KWraTaW3rvxcUm2QXaH51yz6usWAgoPAXx_cFhTU-3fTUB5KA9PQkIygxdYLsD2V6JfYkyXSWDt2Nq5fGzO4g6iZCc4ZwN8VdvD6y7Cs2qpZDYiwnRqhx0Vnk3kM3ygXNjo2GwrOZnNH6sIip3aFAMmMZJ8dwHNcqjITtIlqYayWcU9TZWCeB04ynKOmCxuoKffXkL-si_EIzswTaqmjHBn8WzTNByDRa3SqeFN8FUw"
                alt="Vintage cinema interior"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover opacity-60 grayscale transition-all duration-700 hover:grayscale-0"
              />
            </div>
            <div className="absolute -bottom-8 right-0 hidden bg-[#a0030e] px-6 py-5 lg:block">
              <p className="font-serif text-xl italic text-[#ffa99f]">
                Est. 1924
              </p>
            </div>
          </div>

          <div className="w-full pb-8 lg:w-2/5">
            <h1 className="relative z-10 font-serif text-6xl leading-none text-[#ffe2ab] drop-shadow-2xl md:text-8xl lg:-ml-24">
              Saving Local <br />
              <span className="italic">Cinema.</span>
            </h1>
            <p className="mt-6 max-w-md font-sans text-lg leading-8 text-[#d4c5ab]">
              In an era of endless scrolling, we choose the collective
              experience. Small Town Theater is more than a theater network; it
              is a movement to preserve the magic of the silver screen in the
              heart of our neighborhoods.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mb-32 max-w-7xl px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4 lg:self-center">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#ffbf00]">
                Our Heritage
            </p>
            <h2 className="mt-4 font-serif text-4xl italic text-[#e5e2e1]">
              A Century of Stories
            </h2>
            <p className="mt-6 font-sans leading-7 text-[#d4c5ab]">
              From the silent film era to the digital revolution, our theaters
              have stood as landmarks of culture. We believe these spaces are
              the soul of the community, where first dates happen and lifelong
              memories are forged.
            </p>
          </div>

          <div className="grid gap-8 lg:col-span-8 lg:grid-cols-2">
            <article className="flex aspect-square flex-col justify-between bg-[#1c1b1b] p-8">
              <div>
                <h3 className="font-serif text-2xl text-[#ffe2ab]">
                  The Preservation Era
                </h3>
                <p className="mt-4 font-sans text-sm leading-7 text-[#d4c5ab]">
                  In 2012, when the Jackson Theater faced demolition, a group of
                  local residents launched a grassroots campaign that changed
                  everything. We didn&apos;t just save a building; we saved a
                  way of life.
                </p>
              </div>
              <div className="relative mt-8 h-24 overflow-hidden bg-[#201f1f]">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG0sXbViJlVpVlmKy84HL42-glCnVH_SxnzuI464PTVRbdeM7iQ0-jgsg9XKfjCO8AvCMnSOa2ESaEWp0OkaF3lLGnnC5h_NzmkrORB53HsBottFZNz7DsZuRfV-V_MtWoWU-GTBzRcRbC3Ee1mvnfMoGc4WyJ4kCUVaF3TQzzDW_lJiuBTWL_UPGkAw9y5ZxaL7KIeQmuGQIbQbLRohz2FBXkvz8UDGzTaO_XuijLBsWxPzGeGgT8PQ5jq9Hz3L4igHRCTkEA2xs"
                  alt="Vintage film reel"
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover opacity-40 grayscale"
                />
              </div>
            </article>

            <article className="flex aspect-[4/5] flex-col justify-end bg-[#ffbf00] p-8 lg:aspect-auto">
              <p className="font-serif text-6xl text-[#402d00]">98%</p>
              <p className="mt-4 font-sans text-lg font-semibold uppercase tracking-tight text-[#6d5000]">
                Community Funded Restorations
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mb-32 bg-[#1c1b1b] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-serif text-5xl text-[#e5e2e1]">
                More Than Just Movies
              </h2>
              <p className="mt-4 font-sans leading-7 text-[#d4c5ab]">
                We host weekly events designed to bring neighbors together. From
                local filmmaker showcases to midnight cult classics, there is
                always a seat for you.
              </p>
            </div>
            <Link
              href="/showtimes"
              className="inline-flex border-b border-[#ffbf00] pb-1 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-[#ffbf00] transition-colors hover:border-[#ffe2ab] hover:text-[#ffe2ab]"
            >
              View Calendar
            </Link>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {events.map((event) => (
              <article key={event.title} className="group">
                <div className="relative mb-6 aspect-[3/4] overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="font-serif text-xl italic text-[#e5e2e1]">
                  {event.title}
                </h3>
                <p className="mt-3 font-sans text-sm leading-7 text-[#d4c5ab]">
                  {event.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="text-center">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-[#ffb4ab]">
            The Network
          </p>
          <h2 className="mt-4 font-serif text-5xl italic text-[#e5e2e1]">
            Visit Our Houses
          </h2>
        </div>

        <div className="mt-16 grid gap-px bg-[#504532]/20 lg:grid-cols-2">
          {theaters.map((theater) => (
            <article
              key={theater.title}
              className="flex flex-col gap-8 bg-[#131313] p-8 md:flex-row md:items-start lg:p-12"
            >
              <div className="relative aspect-square w-full overflow-hidden md:w-1/2">
                <Image
                  src={theater.image}
                  alt={theater.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover grayscale"
                />
              </div>
              <div className="w-full md:w-1/2">
                <h3 className="font-serif text-3xl text-[#e5e2e1]">
                  {theater.title}
                </h3>
                <p className="mt-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#ffbf00]">
                  {theater.district}
                </p>
                <ul className="mt-6 space-y-2 font-sans text-sm text-[#d4c5ab]">
                  {theater.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link
                  href={theater.href}
                  className="mt-8 inline-flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-[#ffe2ab] transition-colors hover:text-[#ffbf00]"
                >
                  Directions
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
