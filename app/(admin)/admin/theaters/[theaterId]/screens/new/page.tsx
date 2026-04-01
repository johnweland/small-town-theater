import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminTheater } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSectionCard } from "@/components/admin/section-card";
import {
  AdminCheckbox,
  AdminField,
  AdminFieldGrid,
  AdminInput,
  AdminMockForm,
  AdminSelect,
} from "@/components/admin/admin-form";

export default async function NewScreenPage({
  params,
}: {
  params: Promise<{ theaterId: string }>;
}) {
  const { theaterId } = await params;
  const theater = await getAdminTheater(theaterId);
  if (!theater) notFound();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="New Screen"
        title={`Add a screen for ${theater.name}`}
        description="Room configuration stays simple for now, but the data shape is ready for future scheduling constraints."
        action={
          <Button asChild variant="outline">
            <Link href={`/admin/theaters/${theater.id}/screens`}>Back to Screens</Link>
          </Button>
        }
      />

      <AdminMockForm submitLabel="Create Screen">
        <AdminSectionCard title="Screen Configuration" description="Capture the operational fields that bookings will eventually depend on.">
          <AdminFieldGrid>
            <AdminField label="Name">
              <AdminInput placeholder="Balcony Screen" />
            </AdminField>
            <AdminField label="Slug">
              <AdminInput placeholder="balcony-screen" />
            </AdminField>
            <AdminField label="Capacity">
              <AdminInput type="number" placeholder="80" />
            </AdminField>
            <AdminField label="Sort Order">
              <AdminInput type="number" defaultValue="1" />
            </AdminField>
            <AdminField label="Projection">
              <AdminInput placeholder="4K Laser" />
            </AdminField>
            <AdminField label="Sound Format">
              <AdminInput placeholder="Dolby 7.1" />
            </AdminField>
            <AdminField label="Status">
              <AdminSelect defaultValue="active">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </AdminSelect>
            </AdminField>
          </AdminFieldGrid>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <AdminCheckbox label="Wheelchair seating row" defaultChecked />
            <AdminCheckbox label="Private rentals allowed" />
            <AdminCheckbox label="Assisted listening available" defaultChecked />
            <AdminCheckbox label="Supports event staging" />
          </div>
        </AdminSectionCard>
      </AdminMockForm>
    </div>
  );
}
