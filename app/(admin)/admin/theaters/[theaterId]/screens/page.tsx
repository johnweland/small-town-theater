import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminScreensForTheater, getAdminTheater } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSectionCard } from "@/components/admin/section-card";
import { AdminStatusBadge } from "@/components/admin/status-badge";

export default async function TheaterScreensPage({
  params,
}: {
  params: Promise<{ theaterId: string }>;
}) {
  const { theaterId } = await params;
  const theater = await getAdminTheater(theaterId);
  if (!theater) notFound();

  const screens = await getAdminScreensForTheater(theater.id);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Screens"
        title={`${theater.name} screens`}
        description="Keep room-level scheduling details implementation-ready before persistence exists."
        action={
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href={`/admin/theaters/${theater.id}`}>Back to Theater</Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/theaters/${theater.id}/screens/new`}>New Screen</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {screens.map((screen) => (
          <AdminSectionCard
            key={screen.id}
            title={screen.name}
            description={`${screen.capacity} seats • ${screen.projection} • ${screen.soundFormat}`}
            action={<AdminStatusBadge status={screen.status} />}
          >
            <div className="flex flex-wrap gap-2">
              {screen.features.map((feature) => (
                <AdminStatusBadge key={feature} status={feature.toLowerCase()} />
              ))}
            </div>
            <div className="mt-5">
              <Button asChild variant="outline">
                <Link href={`/admin/theaters/${theater.id}/screens/${screen.id}`}>
                  Edit Screen
                </Link>
              </Button>
            </div>
          </AdminSectionCard>
        ))}
      </div>
    </div>
  );
}
