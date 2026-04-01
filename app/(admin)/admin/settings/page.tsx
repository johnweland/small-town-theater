import { Cog, Palette, ShieldCheck } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSectionCard } from "@/components/admin/section-card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Settings"
        title="Site settings placeholder"
        description="A polished stub for future operational settings, brand controls, and publishing preferences."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Brand & Marquee",
            description:
              "Future home for headline copy, theme accents, and shared cinema-brand assets.",
            icon: Palette,
          },
          {
            title: "Operations",
            description:
              "Future controls for box office defaults, membership rules, and internal workflow preferences.",
            icon: Cog,
          },
          {
            title: "Permissions",
            description:
              "Future roles, notification routing, and approval steps for the admin team.",
            icon: ShieldCheck,
          },
        ].map(({ title, description, icon: Icon }) => (
          <AdminSectionCard
            key={title}
            title={title}
            description={description}
          >
            <div className="rounded-lg bg-surface-container-high p-5 text-primary">
              <Icon className="size-6" />
            </div>
          </AdminSectionCard>
        ))}
      </div>
    </div>
  );
}
