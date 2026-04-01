import { notFound } from "next/navigation";

import { getAdminTheater } from "@/lib/admin";
import { NewScreenForm } from "@/components/admin/new-screen-form";

export default async function NewScreenPage({
  params,
}: {
  params: Promise<{ theaterId: string }>;
}) {
  const { theaterId } = await params;
  const theater = await getAdminTheater(theaterId);
  if (!theater) notFound();

  return <NewScreenForm theater={theater} />;
}
