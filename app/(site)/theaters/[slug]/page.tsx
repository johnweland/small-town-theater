import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TheaterView } from "@/components/site/theater-view";
import {
  getComingSoonMovies,
  getPrimaryMembershipProgram,
  getTheaterWithShowtimes,
  getTheaters,
} from "@/lib/data";
import { APP_NAME } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const theater = await getTheaterWithShowtimes(slug);

  if (!theater) {
    return {
      title: "Theater Not Found",
      description: `The requested theater could not be found at ${APP_NAME}.`,
    };
  }

  const description =
    theater.descriptionParagraphs[0] ??
    `Explore showtimes, membership perks, and venue details for ${theater.name} in ${theater.city}, ${theater.state}.`;

  return {
    title: theater.name,
    description,
    openGraph: {
      title: theater.name,
      description,
      type: "website",
      images: [
        {
          url: theater.heroImage,
          alt: `${theater.name} exterior`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: theater.name,
      description,
      images: [theater.heroImage],
    },
  };
}

export default async function TheaterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [theater, membership, theaters, comingSoonMovies] = await Promise.all([
    getTheaterWithShowtimes(slug),
    getPrimaryMembershipProgram(),
    getTheaters(),
    getComingSoonMovies(),
  ]);

  if (!theater) notFound();

  return (
    <TheaterView
      theater={theater}
      membership={membership}
      theaters={theaters}
      comingSoonMovies={comingSoonMovies}
    />
  );
}
