import Link from "next/link";

import { getAdminTheaters } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSectionCard } from "@/components/admin/section-card";
import {
  AdminField,
  AdminFieldGrid,
  AdminInput,
  AdminMockForm,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/admin-form";

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

      <AdminMockForm submitLabel="Save Event Draft">
        <AdminSectionCard title="Event Details" description="Capture the core marketing fields and local scheduling details.">
          <AdminFieldGrid>
            <AdminField label="Title">
              <AdminInput placeholder="Friday Classics Club" />
            </AdminField>
            <AdminField label="Slug">
              <AdminInput placeholder="friday-classics-club" />
            </AdminField>
            <AdminField label="Theater">
              <AdminSelect>
                {theaters.map((theater) => (
                  <option key={theater.id} value={theater.id}>
                    {theater.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
            <AdminField label="Published Status">
              <AdminSelect defaultValue="draft">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="Start">
              <AdminInput type="datetime-local" />
            </AdminField>
            <AdminField label="End">
              <AdminInput type="datetime-local" />
            </AdminField>
            <AdminField label="Image URL">
              <AdminInput placeholder="https://..." />
            </AdminField>
          </AdminFieldGrid>
          <div className="mt-5 grid gap-5">
            <AdminField label="Summary">
              <AdminTextarea placeholder="Short event summary for cards and teasers." />
            </AdminField>
            <AdminField label="Description">
              <AdminTextarea placeholder="Long-form internal or public description..." />
            </AdminField>
          </div>
        </AdminSectionCard>
      </AdminMockForm>
    </div>
  );
}
