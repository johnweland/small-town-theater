/* eslint-disable @next/next/no-img-element */
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
        {events.length === 0 ? (
          <AdminSectionCard
            title="No events yet"
            description="Create the first event to populate the library."
          >
            <Button asChild>
              <Link href="/admin/events/new">Add Event</Link>
            </Button>
          </AdminSectionCard>
        ) : null}
        {events.map((event) => {
          const theater = theaters.find((item) => item.id === event.theaterId);

          return (
            <AdminSectionCard
              key={event.id}
              title={event.title}
              description={`${theater?.name ?? "Unknown theater"} • ${event.startsAtLabel} to ${event.endsAtLabel}`}
              action={<AdminStatusBadge status={event.status} />}
            >
              <div className="grid gap-5 md:grid-cols-[96px_1fr] md:items-start">
                <div className="overflow-hidden rounded-md bg-surface-container-highest">
                  <img
                    src={event.imagePreview ?? event.image}
                    alt={`${event.title} poster`}
                    className="h-36 w-24 object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm leading-6 text-muted-foreground">{event.summary}</p>
                  <div className="mt-5">
                    <Button asChild variant="outline">
                      <Link href={`/admin/events/${event.id}`}>Edit Event</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </AdminSectionCard>
          );
        })}
      </div>
    </div>
  );
}
