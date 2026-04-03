import Link from "next/link";

import { getAdminTheaters } from "@/lib/admin";
import { createEventAction } from "@/app/(admin)/admin/events/actions";
import { Button } from "@/components/ui/button";
import { AdminEventForm } from "@/components/admin/event-form";
import { AdminPageHeader } from "@/components/admin/page-header";

export default async function NewEventPage() {
  const theaters = await getAdminTheaters();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="New Event"
        title="Create an event"
        description="Event authoring mirrors the structure needed for future public publishing and image/media management."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/events">Back to Events</Link>
          </Button>
        }
      />

      <AdminEventForm theaters={theaters} action={createEventAction} />
    </div>
  );
}
