import Link from "next/link";

import { getAdminEvents, getAdminTheaters } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSectionCard } from "@/components/admin/section-card";
import { AdminStatusBadge } from "@/components/admin/status-badge";

export default async function EventsPage() {
  const [events, theaters] = await Promise.all([
    getAdminEvents(),
    getAdminTheaters(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Community Programs"
        title="Events library"
        description="Plan special screenings, fundraisers, and courtyard nights with a clean event authoring structure."
        action={
          <Button asChild>
            <Link href="/admin/events/new">Add Event</Link>
          </Button>
        }
      />

      <div className="grid gap-5">
        {events.map((event) => {
          const theater = theaters.find((item) => item.id === event.theaterId);

          return (
            <AdminSectionCard
              key={event.id}
              title={event.title}
              description={`${theater?.name ?? "Unknown theater"} • ${event.startsAt} to ${event.endsAt}`}
              action={<AdminStatusBadge status={event.status} />}
            >
              <p className="text-sm leading-6 text-muted-foreground">{event.summary}</p>
              <div className="mt-5">
                <Button asChild variant="outline">
                  <Link href={`/admin/events/${event.id}`}>Edit Event</Link>
                </Button>
              </div>
            </AdminSectionCard>
          );
        })}
      </div>
    </div>
  );
}
