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
          <AdminSectionCard title="Publishing Notes" description="Placeholder area for future audience targeting, ticketing, and media integrations.">
            <p className="text-sm leading-6 text-muted-foreground">
              This event editor now reads and writes through Amplify, while keeping media, venue, schedule, and publication state separated for later public publishing work.
            </p>
          </AdminSectionCard>
          <AdminConfirmDelete
            title="Delete this event"
            description="Deleting this event removes the Amplify record and returns you to the events library."
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
