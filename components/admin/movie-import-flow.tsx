"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, LoaderCircle, Search, Sparkles } from "lucide-react";

import type { ImportCandidate } from "@/lib/admin";
import { createAdminNoticeHref } from "@/lib/admin/notice";
import { getAmplifyClient } from "@/lib/amplify/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminEmptyState } from "@/components/admin/empty-state";
import { AdminSectionCard } from "@/components/admin/section-card";
import { AdminStatusBadge } from "@/components/admin/status-badge";

function toAmplifyDate(value?: string) {
  if (!value) {
    return undefined;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

export function AdminMovieImportFlow({
  candidates,
  initialQuery,
}: {
  candidates: ImportCandidate[];
  initialQuery: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query.trim());
  const [results, setResults] = useState(candidates);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedId, setSelectedId] = useState(candidates[0]?.id ?? "");
  const [hasSearched, setHasSearched] = useState(initialQuery.trim().length > 0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setResults(candidates);
    setSelectedId((current) => current || candidates[0]?.id || "");
  }, [candidates]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (deferredQuery === initialQuery.trim()) {
      return;
    }

    if (deferredQuery.length < 2) {
      startTransition(() => {
        setResults([]);
        setHasSearched(false);
        setSelectedId("");
      });
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);

      try {
        const response = await fetch(
          `/api/tmdb/search?query=${encodeURIComponent(deferredQuery)}`,
          { cache: "no-store", signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("Search failed");
        }

        const payload = (await response.json()) as {
          candidates: ImportCandidate[];
        };

        startTransition(() => {
          setResults(payload.candidates);
          setHasSearched(true);
          setSelectedId(payload.candidates[0]?.id ?? "");
          setSaveError(null);
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          startTransition(() => {
            setResults([]);
            setHasSearched(true);
            setSelectedId("");
          });
        }
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [deferredQuery, initialQuery]);

  const selected =
    results.find((candidate) => candidate.id === selectedId) ??
    results[0];

  return (
    <div
      data-e2e-ready={isHydrated ? "true" : undefined}
      className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]"
    >
      <AdminSectionCard
        title="Search External Catalog"
        description="Search TMDB directly from the admin panel, then review the selected result with enriched metadata before importing."
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-10"
                placeholder="Search title, year, or genre..."
              />
            </div>
            <div className="flex items-center gap-3">
              {isSearching ? (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin text-primary" />
                  Searching…
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {results.length > 0
                    ? `${results.length} result${results.length === 1 ? "" : "s"}`
                    : "Type at least 2 characters"}
                </span>
              )}
            </div>
          </div>
          {results.length > 0 ? (
            <div className="grid gap-3">
              {results.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(candidate.id);
                    setSaveError(null);
                  }}
                  className={`grid grid-cols-[64px_1fr_auto] items-center gap-4 rounded-lg p-3 text-left transition-colors ${
                    candidate.id === selected?.id
                      ? "bg-primary/10"
                      : "bg-surface-container-high hover:bg-surface-container-highest"
                  }`}
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-md">
                    <Image
                      src={candidate.poster}
                      alt={candidate.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-serif text-2xl italic text-foreground">
                      {candidate.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {candidate.year} • {candidate.genres.join(" / ")}
                    </p>
                  </div>
                  {candidate.status ? <AdminStatusBadge status={candidate.status} /> : null}
                </button>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              title={
                hasSearched
                  ? "No TMDB matches found"
                  : "Start a TMDB search"
              }
              description={
                hasSearched
                  ? "Try a broader title, alternate spelling, or release year."
                  : "Search for a film title to load real TMDB results into the import workflow."
              }
            />
          )}
        </div>
      </AdminSectionCard>

      {selected ? (
        <AdminSectionCard
          title="Import Confirmation"
          description="Review the selected title, media treatment, and casting details before saving it into the local library."
        >
          <div className="flex flex-col gap-6">
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
              <Image
                src={selected.backdrop}
                alt={selected.title}
                fill
                sizes="(max-width: 1280px) 100vw, 40vw"
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end gap-4 p-5">
                <div className="relative aspect-[2/3] w-28 overflow-hidden rounded-md shadow-lg shadow-black/40">
                  <Image
                    src={selected.poster}
                    alt={`${selected.title} poster`}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                    Selected Match
                  </p>
                  <h2 className="mt-2 font-serif text-4xl italic text-foreground">
                    {selected.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selected.year} • {selected.genres.join(" / ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-lg bg-surface-container-high p-4">
                <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                  Overview
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {selected.overview}
                </p>
              </div>
              <div className="rounded-lg bg-surface-container-high p-4">
                <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                  Trailer
                </p>
                {selected.trailerYouTubeId ? (
                  <div className="mt-3 flex flex-col gap-3">
                    <div className="aspect-video overflow-hidden rounded-md bg-background/60">
                      <iframe
                        className="size-full"
                        src={`https://www.youtube-nocookie.com/embed/${selected.trailerYouTubeId}`}
                        title={`${selected.title} trailer`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <Button asChild variant="outline">
                      <Link
                        href={`https://www.youtube.com/watch?v=${selected.trailerYouTubeId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink data-icon="inline-start" />
                        Watch on YouTube
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="mt-3 flex min-h-28 items-center justify-center rounded-md bg-background/60 text-sm text-muted-foreground">
                    {selected.trailerLabel}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-lg bg-surface-container-high p-4">
                <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                  Genres
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.genres.map((genre) => (
                    <AdminStatusBadge key={genre} status={genre.toLowerCase()} />
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-surface-container-high p-4">
                <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                  Cast Highlights
                </p>
                <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                  {selected.castHighlights.map((performer) => (
                    <li key={performer}>{performer}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-lg bg-surface-container-high p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="size-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Ready to create a movie record with imported artwork and metadata.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {saveError ? (
                  <span className="text-sm text-destructive">{saveError}</span>
                ) : null}
                <Button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setSaveError(null);
                    setIsSaving(true);

                    void (async () => {
                      const client = getAmplifyClient();
                      if (!client.models.Movie) {
                        setSaveError(
                          "Movie saving is not available right now. Refresh the page and try again."
                        );
                        setIsSaving(false);
                        return;
                      }

                      const releaseDate = toAmplifyDate(selected.releaseDate);

                      const response = await client.models.Movie.create(
                        {
                          slug: `${selected.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${selected.tmdbId ?? selected.year}`,
                          title: selected.title,
                          tagline: selected.tagline ?? null,
                          rating: selected.rating ?? "NR",
                          runtime: selected.runtime ?? null,
                          genre: selected.genres.join(" / "),
                          status:
                            selected.status === "coming-soon"
                              ? "comingSoon"
                              : selected.status === "archived"
                                ? "archived"
                                : selected.status === "draft"
                                  ? "draft"
                                  : "nowPlaying",
                          director: selected.director ?? null,
                          cast: selected.castHighlights,
                          synopsis: selected.overview,
                          production:
                            selected.productionCompanies?.[0] ??
                            "Production unavailable",
                          score:
                            selected.audienceScore
                              ? `TMDB ${selected.audienceScore}`
                              : null,
                          cinematography: null,
                          backdrop: selected.backdrop,
                          poster: selected.poster,
                          ...(releaseDate ? { releaseDate } : {}),
                          audienceScore: selected.audienceScore ?? null,
                          originalLanguage: selected.originalLanguage ?? null,
                          productionCompanies: selected.productionCompanies ?? [],
                          tmdbId: selected.tmdbId ?? null,
                          trailerYouTubeId: selected.trailerYouTubeId ?? null,
                        },
                        { authMode: "userPool" }
                      );

                      if (response.errors?.length) {
                        setSaveError(
                          response.errors.map((item) => item.message).join("; ")
                        );
                        setIsSaving(false);
                        return;
                      }

                      router.push(
                        createAdminNoticeHref(
                          response.data?.id
                            ? `/admin/movies/${response.data.id}`
                            : "/admin/movies",
                          {
                            type: "success",
                            message: "Movie imported successfully.",
                          }
                        )
                      );
                      router.refresh();
                    })().finally(() => {
                      setIsSaving(false);
                    });
                  }}
                >
                  {isSaving ? "Importing..." : "Import Movie"}
                </Button>
              </div>
            </div>
          </div>
        </AdminSectionCard>
      ) : null}
    </div>
  );
}
