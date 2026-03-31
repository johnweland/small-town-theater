export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_var(--color-accent),_transparent_35%),linear-gradient(180deg,_var(--color-background),_color-mix(in_oklab,_var(--color-background)_92%,_black))] px-6 py-24">
      <section className="w-full max-w-4xl rounded-3xl border border-border/60 bg-card/90 p-10 shadow-xl shadow-black/10 backdrop-blur sm:p-14">
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Starter Workspace
            </p>
            <h1 className="max-w-2xl font-serif text-5xl tracking-tight text-balance text-foreground sm:text-6xl">
              Small Town Theater
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Now you have a clean foundation with linting, unit tests,
              Playwright end-to-end coverage, and PR checks wired up.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-border/70 bg-background/80 p-5">
              <h2 className="text-base font-semibold">Build features</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Replace this page with show listings, tickets, seasons, and
                venue details when you are ready.
              </p>
            </article>
            <article className="rounded-2xl border border-border/70 bg-background/80 p-5">
              <h2 className="text-base font-semibold">Test confidently</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Keep small logic checks in Vitest and reserve Playwright for
                the flows your audience depends on.
              </p>
            </article>
            <article className="rounded-2xl border border-border/70 bg-background/80 p-5">
              <h2 className="text-base font-semibold">Ship with PR checks</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Every pull request can lint, test, and build before changes land
                on main.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
