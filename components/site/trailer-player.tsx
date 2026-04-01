"use client";

import { useState } from "react";
import Image from "next/image";

interface TrailerPlayerProps {
  title: string;
  backdrop: string;
  trailerYouTubeId?: string;
}

export function TrailerPlayer({
  title,
  backdrop,
  trailerYouTubeId,
}: TrailerPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasTrailer = Boolean(trailerYouTubeId);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (hasTrailer) {
            setIsOpen(true);
          }
        }}
        disabled={!hasTrailer}
        className={`group relative flex aspect-video w-full items-center justify-center overflow-hidden bg-[#353534] shadow-[0_24px_48px_rgba(0,0,0,0.45)] ${
          hasTrailer ? "cursor-pointer" : "cursor-not-allowed opacity-80"
        }`}
        aria-label={
          hasTrailer ? `Play trailer for ${title}` : `Trailer unavailable for ${title}`
        }
      >
        <Image
          src={backdrop}
          alt={`${title} trailer still`}
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-cover opacity-60 transition-opacity group-hover:opacity-40"
        />
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-[#ffbf00] text-[#402d00] shadow-xl transition-transform group-hover:scale-110">
          <span className="text-4xl">▶</span>
        </div>
        <div className="absolute bottom-4 left-4 bg-[#131313]/80 px-4 py-2 font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#ffe2ab] backdrop-blur-sm">
          {hasTrailer ? "Watch Trailer" : "Trailer Unavailable"}
        </div>
      </button>

      {isOpen && trailerYouTubeId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/90 px-4">
          <div className="w-full max-w-5xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-serif text-2xl text-[#e5e2e1]">{title} Trailer</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-[#1c1b1b] px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#ffe2ab] transition-colors hover:bg-[#2a2a2a]"
              >
                Close
              </button>
            </div>
            <div className="relative aspect-video overflow-hidden bg-black shadow-[0_24px_48px_rgba(0,0,0,0.45)]">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerYouTubeId}?autoplay=1&rel=0`}
                title={`${title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
