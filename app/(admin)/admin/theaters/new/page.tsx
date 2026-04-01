import Link from "next/link";

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

export default function NewTheaterPage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="New Venue"
        title="Add a theater"
        description="Create the shell of a new location with enough structure that venue settings, screens, and events can hang off it later."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/theaters">Back to Theaters</Link>
          </Button>
        }
      />

      <AdminMockForm submitLabel="Create Theater">
        <AdminSectionCard title="Core Details" description="Store venue-specific public and internal details here, while keeping organization-wide programs like memberships in separate models.">
          <AdminFieldGrid>
            <AdminField label="Name">
              <AdminInput placeholder="Fairmont Theater" />
            </AdminField>
            <AdminField label="Slug">
              <AdminInput placeholder="fairmont-theater" />
            </AdminField>
            <AdminField label="City">
              <AdminInput placeholder="Fairmont" />
            </AdminField>
            <AdminField label="Status">
              <AdminSelect defaultValue="active">
                <option value="active">Active</option>
                <option value="seasonal">Seasonal</option>
                <option value="inactive">Inactive</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="Phone">
              <AdminInput placeholder="(555) 010-2001" />
            </AdminField>
            <AdminField label="Contact Email">
              <AdminInput placeholder="manager@smalltowntheater.org" />
            </AdminField>
            <AdminField label="Address" description="Historic district copy can stay embedded until a normalized address model exists.">
              <AdminInput placeholder="100 Main Street · Historic District" />
            </AdminField>
            <AdminField label="Manager">
              <AdminInput placeholder="Jordan Ellis" />
            </AdminField>
          </AdminFieldGrid>
        </AdminSectionCard>

        <AdminSectionCard title="Operational Notes" description="Use this space for local context, staffing notes, or programming constraints.">
          <AdminField label="Notes">
            <AdminTextarea placeholder="Seasonal courtyard use, staffing notes, accessibility details..." />
          </AdminField>
        </AdminSectionCard>
      </AdminMockForm>
    </div>
  );
}
