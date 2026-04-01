import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminScreen, getAdminTheater } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSectionCard } from "@/components/admin/section-card";
import {
  AdminCheckbox,
  AdminConfirmDelete,
  AdminField,
  AdminFieldGrid,
  AdminInput,
  AdminMockForm,
  AdminSelect,
} from "@/components/admin/admin-form";
import { AdminStatusBadge } from "@/components/admin/status-badge";

export default async function ScreenDetailPage({
  params,
}: {
  params: Promise<{ theaterId: string; screenId: string }>;
}) {
  const { theaterId, screenId } = await params;
  const [theater, screen] = await Promise.all([
    getAdminTheater(theaterId),
    getAdminScreen(screenId),
  ]);

  if (!theater || !screen || screen.theaterId !== theater.id) notFound();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Screen Detail"
        title={screen.name}
        description={`${theater.name} • ${screen.capacity} seats • ${screen.projection}`}
        action={<AdminStatusBadge status={screen.status} />}
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <AdminMockForm submitLabel="Save Screen">
          <AdminSectionCard title="Room Settings" description="Screen-level metadata is ready for future availability, pricing, and accessibility integrations.">
            <AdminFieldGrid>
              <AdminField label="Name">
                <AdminInput defaultValue={screen.name} />
              </AdminField>
              <AdminField label="Slug">
                <AdminInput defaultValue={screen.slug} />
              </AdminField>
              <AdminField label="Capacity">
                <AdminInput type="number" defaultValue={String(screen.capacity)} />
              </AdminField>
              <AdminField label="Sort Order">
                <AdminInput type="number" defaultValue={String(screen.sortOrder)} />
              </AdminField>
              <AdminField label="Projection">
                <AdminInput defaultValue={screen.projection} />
              </AdminField>
              <AdminField label="Sound Format">
                <AdminInput defaultValue={screen.soundFormat} />
              </AdminField>
              <AdminField label="Status">
                <AdminSelect defaultValue={screen.status}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </AdminSelect>
              </AdminField>
            </AdminFieldGrid>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {screen.features.map((feature) => (
                <AdminCheckbox key={feature} label={feature} defaultChecked />
              ))}
            </div>
          </AdminSectionCard>
        </AdminMockForm>

        <div className="flex flex-col gap-8">
          <AdminSectionCard title="Scheduling Notes" description="Keep a quick summary of how this room behaves for operators.">
            <div className="grid gap-3">
              <div className="rounded-lg bg-surface-container-high p-4">
                <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                  Best use
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {screen.status === "active"
                    ? "Available for regular programming and event holds."
                    : "Currently offline, but still modeled for future reactivation."}
                </p>
              </div>
            </div>
          </AdminSectionCard>

          <AdminConfirmDelete
            title="Retire this screen"
            description="This keeps the destructive UX realistic without removing any mock data."
          />

          <Button asChild variant="outline">
            <Link href={`/admin/theaters/${theater.id}/screens`}>Back to Screens</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
