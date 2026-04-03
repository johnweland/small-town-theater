import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminEvent, getAdminTheaters } from "@/lib/admin";
import {
  deleteEventAction,
  updateEventAction,
} from "@/app/(admin)/admin/events/actions";
import { Button } from "@/components/ui/button";
import { AdminEventForm } from "@/components/admin/event-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSectionCard } from "@/components/admin/section-card";
import {
  AdminConfirmDelete,
} from "@/components/admin/admin-form";
import { AdminStatusBadge } from "@/components/admin/status-badge";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [event, theaters] = await Promise.all([
    getAdminEvent(eventId),
    getAdminTheaters(),
  ]);
  if (!event) notFound();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Event Detail"
        title={event.title}
        description={event.summary}
        action={<AdminStatusBadge status={event.status} />}
      />

      <div className="flex flex-col gap-8">
        <AdminEventForm theaters={theaters} event={event} action={updateEventAction} />
        <div className="flex flex-col gap-8">
          <AdminSectionCard title="Publishing Notes" description="Space for audience targeting, ticketing, and media planning as the workflow expands.">
            <p className="text-sm leading-6 text-muted-foreground">
              Keep media, venue, schedule, and publication details organized here as event operations grow more sophisticated.
            </p>
          </AdminSectionCard>
          <AdminConfirmDelete
            title="Delete this event"
            description="Deleting this event removes it from the library and returns you to the events list."
            action={deleteEventAction}
            itemId={event.id}
          />
          <Button asChild variant="outline">
            <Link href="/admin/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
