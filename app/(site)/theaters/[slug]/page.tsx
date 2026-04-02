import { notFound } from "next/navigation";

import { TheaterView } from "@/components/site/theater-view";
import {
  getComingSoonMovies,
  getPrimaryMembershipProgram,
  getTheaterWithShowtimes,
  getTheaters,
} from "@/lib/data";

export const dynamic = "force-dynamic";

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
