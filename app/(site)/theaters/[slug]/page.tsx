import { notFound } from "next/navigation";

import { TheaterView } from "@/components/site/theater-view";
import {
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
  const [theater, membership, theaters] = await Promise.all([
    getTheaterWithShowtimes(slug),
    getPrimaryMembershipProgram(),
    getTheaters(),
  ]);

  if (!theater) notFound();

  return (
    <TheaterView theater={theater} membership={membership} theaters={theaters} />
  );
}
