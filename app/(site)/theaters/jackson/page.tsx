import { notFound } from "next/navigation";
import { TheaterView } from "@/components/site/theater-view";
import { getPrimaryMembershipProgram, getTheaterWithShowtimes } from "@/lib/data";

export default async function JacksonTheaterPage() {
  const [theater, membership] = await Promise.all([
    getTheaterWithShowtimes("jackson"),
    getPrimaryMembershipProgram(),
  ]);
  if (!theater) notFound();

  return <TheaterView theater={theater} membership={membership} />;
}
