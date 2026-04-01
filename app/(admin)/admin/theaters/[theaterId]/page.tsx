import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAdminBookings,
  getAdminScreensForTheater,
  getAdminTheater,
} from "@/lib/admin";
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

export default async function TheaterDetailPage({
  params,
}: {
  params: Promise<{ theaterId: string }>;
}) {
  const { theaterId } = await params;
  const theater = await getAdminTheater(theaterId);
  if (!theater) notFound();

  const [screens, bookings] = await Promise.all([
    getAdminScreensForTheater(theater.id),
    getAdminBookings(),
  ]);

  const relatedBookings = bookings.filter((booking) => booking.theaterId === theater.id);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Theater Detail"
        title={theater.name}
        description={`${theater.city}, ${theater.state} • ${theater.address}`}
        action={
          <div className="flex gap-3">
            <AdminStatusBadge status={theater.status} />
            <Button asChild variant="outline">
              <Link href={`/admin/theaters/${theater.id}/screens`}>Manage Screens</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminMockForm submitLabel="Save Theater Changes">
          <div className="flex flex-col gap-8">
            <AdminSectionCard
              title="Operational Details"
              description="Venue-specific operational data and public theater storytelling live here. Organization-wide memberships are modeled separately."
            >
              <AdminFieldGrid>
                <AdminField label="Name">
                  <AdminInput defaultValue={theater.name} />
                </AdminField>
                <AdminField label="Slug">
                  <AdminInput defaultValue={theater.slug} />
                </AdminField>
                <AdminField label="City">
                  <AdminInput defaultValue={theater.city} />
                </AdminField>
                <AdminField label="State">
                  <AdminInput defaultValue={theater.state} />
                </AdminField>
                <AdminField label="District">
                  <AdminInput defaultValue={theater.district} />
                </AdminField>
                <AdminField label="Established">
                  <AdminInput type="number" defaultValue={String(theater.established)} />
                </AdminField>
                <AdminField label="Status">
                  <AdminSelect defaultValue={theater.status}>
                    <option value="active">Active</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="inactive">Inactive</option>
                  </AdminSelect>
                </AdminField>
                <AdminField label="Phone">
                  <AdminInput defaultValue={theater.phone} />
                </AdminField>
                <AdminField label="Contact Email">
                  <AdminInput defaultValue={theater.contactEmail} />
                </AdminField>
                <AdminField label="Manager">
                  <AdminInput defaultValue={theater.manager} />
                </AdminField>
                <AdminField label="Address">
                  <AdminInput defaultValue={theater.address} />
                </AdminField>
                <AdminField label="Hero Image">
                  <AdminInput defaultValue={theater.heroImage} />
                </AdminField>
              </AdminFieldGrid>
              <div className="mt-5">
                <AdminField label="Operational Notes">
                  <AdminTextarea defaultValue={theater.notes} />
                </AdminField>
              </div>
            </AdminSectionCard>

            <AdminSectionCard
              title="Public Story & Experience"
              description="These venue-specific fields drive the public theater pages."
            >
              <div className="grid gap-5">
                <AdminField label="Intro Paragraph">
                  <AdminTextarea defaultValue={theater.descriptionParagraphs[0] ?? ""} />
                </AdminField>
                <AdminField label="Secondary Paragraph">
                  <AdminTextarea defaultValue={theater.descriptionParagraphs[1] ?? ""} />
                </AdminField>
                <AdminField label="Venue Specs">
                  <AdminTextarea
                    defaultValue={theater.specs
                      .map((spec) => `${spec.label}: ${spec.value}`)
                      .join("\n")}
                  />
                </AdminField>
                <AdminField label="Concessions">
                  <AdminTextarea
                    defaultValue={theater.concessions
                      .map((item) => `${item.name} — ${item.price} — ${item.note}`)
                      .join("\n")}
                  />
                </AdminField>
              </div>
            </AdminSectionCard>
          </div>
        </AdminMockForm>

        <div className="flex flex-col gap-8">
          <AdminSectionCard title="Venue Snapshot" description="Design-led summary card mirroring the Stitch reference mood.">
            <div className="flex flex-col gap-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src={theater.heroImage}
                  alt={theater.name}
                  fill
                  sizes="(max-width: 1280px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-surface-container-high p-4">
                  <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                    Screens
                  </p>
                  <p className="mt-2 font-serif text-3xl italic">{screens.length}</p>
                </div>
                <div className="rounded-lg bg-surface-container-high p-4">
                  <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                    Related Bookings
                  </p>
                  <p className="mt-2 font-serif text-3xl italic">{relatedBookings.length}</p>
                </div>
              </div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Membership Program"
            description="Membership is organization-wide and should remain separate from any single theater record."
          >
            <p className="text-sm leading-7 text-muted-foreground">
              This theater can display shared membership messaging on the public site, but
              the membership program itself belongs to the broader Small Town Theater
              organization. Model and edit it separately so the same benefits apply across
              every venue.
            </p>
          </AdminSectionCard>

          <AdminSectionCard
            title="Screens"
            description="Each screen is modeled separately so schedule logic can eventually target a specific room."
            action={
              <Button asChild variant="outline">
                <Link href={`/admin/theaters/${theater.id}/screens/new`}>Add Screen</Link>
              </Button>
            }
          >
            <div className="flex flex-col gap-3">
              {screens.map((screen) => (
                <Link
                  key={screen.id}
                  href={`/admin/theaters/${theater.id}/screens/${screen.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg bg-surface-container-high p-4"
                >
                  <div>
                    <p className="font-serif text-xl italic">{screen.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {screen.capacity} seats • {screen.projection}
                    </p>
                  </div>
                  <AdminStatusBadge status={screen.status} />
                </Link>
              ))}
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Booking Summary" description="Useful cross-links without wiring up a reporting backend yet.">
            <div className="flex flex-col gap-3">
              {relatedBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/schedule/${booking.id}`}
                  className="rounded-lg bg-surface-container-high p-4"
                >
                  <p className="font-sans text-sm font-semibold text-foreground">{booking.note}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {booking.runStartsOn} through {booking.runEndsOn}
                  </p>
                </Link>
              ))}
            </div>
          </AdminSectionCard>

          <AdminConfirmDelete
            title="Archive this theater"
            description="This is a local UI-only safeguard for the future destructive workflow."
          />
        </div>
      </div>
    </div>
  );
}
