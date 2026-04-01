"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, LoaderCircle, Search, Sparkles } from "lucide-react";

import type { ImportCandidate } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminEmptyState } from "@/components/admin/empty-state";
import { AdminSectionCard } from "@/components/admin/section-card";
import { AdminStatusBadge } from "@/components/admin/status-badge";

export function AdminMovieImportFlow({
  candidates,
  initialQuery,
}: {
  candidates: ImportCandidate[];
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query.trim());
  const [results, setResults] = useState(candidates);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedId, setSelectedId] = useState(candidates[0]?.id ?? "");
  const [hasSearched, setHasSearched] = useState(initialQuery.trim().length > 0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setResults(candidates);
    setSelectedId((current) => current || candidates[0]?.id || "");
  }, [candidates]);

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
          `/api/admin/tmdb-search?query=${encodeURIComponent(deferredQuery)}`,
          { signal: controller.signal }
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
          setSaved(false);
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
    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
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
                    setSaved(false);
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
                  <AdminStatusBadge status="coming-soon" />
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
                  Ready to create a local movie record with imported artwork and metadata.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {saved ? (
                  <span className="text-sm text-primary">Imported locally</span>
                ) : null}
                <Button type="button" onClick={() => setSaved(true)}>
                  Save Import
                </Button>
              </div>
            </div>
          </div>
        </AdminSectionCard>
      ) : null}
    </div>
  );
}
