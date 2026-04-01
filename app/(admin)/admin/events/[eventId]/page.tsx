import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminEvent, getAdminTheaters } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSectionCard } from "@/components/admin/section-card";
import {
  AdminConfirmDelete,
  AdminField,
  AdminFieldGrid,
  AdminInput,
  AdminMockForm,
  AdminSelect,
  AdminTextarea,
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

      <div className="grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <AdminMockForm submitLabel="Save Event">
          <AdminSectionCard title="Editable Event Fields" description="Polished event editing now, future publishing model later.">
            <AdminFieldGrid>
              <AdminField label="Title">
                <AdminInput defaultValue={event.title} />
              </AdminField>
              <AdminField label="Slug">
                <AdminInput defaultValue={event.slug} />
              </AdminField>
              <AdminField label="Theater">
                <AdminSelect defaultValue={event.theaterId}>
                  {theaters.map((theater) => (
                    <option key={theater.id} value={theater.id}>
                      {theater.name}
                    </option>
                  ))}
                </AdminSelect>
              </AdminField>
              <AdminField label="Status">
                <AdminSelect defaultValue={event.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </AdminSelect>
              </AdminField>
              <AdminField label="Start">
                <AdminInput
                  type="datetime-local"
                  defaultValue={event.startsAt.slice(0, 16)}
                />
              </AdminField>
              <AdminField label="End">
                <AdminInput
                  type="datetime-local"
                  defaultValue={event.endsAt.slice(0, 16)}
                />
              </AdminField>
              <AdminField label="Image URL">
                <AdminInput defaultValue={event.image} />
              </AdminField>
            </AdminFieldGrid>
            <div className="mt-5 grid gap-5">
              <AdminField label="Summary">
                <AdminTextarea defaultValue={event.summary} />
              </AdminField>
              <AdminField label="Description">
                <AdminTextarea defaultValue={event.description} />
              </AdminField>
            </div>
          </AdminSectionCard>
        </AdminMockForm>

        <div className="flex flex-col gap-8">
          <AdminSectionCard title="Publishing Notes" description="Placeholder area for future audience targeting, ticketing, and media integrations.">
            <p className="text-sm leading-6 text-muted-foreground">
              This event editor already separates summary, description, media, venue, and publication state so later Amplify-backed records can slot in cleanly.
            </p>
          </AdminSectionCard>
          <AdminConfirmDelete
            title="Delete this event"
            description="A realistic confirmation pattern is in place even though persistence is still mocked."
          />
          <Button asChild variant="outline">
            <Link href="/admin/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
