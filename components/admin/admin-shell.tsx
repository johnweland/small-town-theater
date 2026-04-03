"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  CalendarDays,
  Film,
  Popcorn,
  HelpCircle,
  LayoutDashboard,
  Search,
  Settings,
  Ticket,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AdminNotice } from "@/components/admin/admin-notice";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/theaters", label: "Theaters", icon: Building2 },
  { href: "/admin/movies", label: "Movies", icon: Film },
  { href: "/admin/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/admin/events", label: "Events", icon: Ticket },
  { href: "/concessions", label: "Concessions", icon: Popcorn },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail?: string | null;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-72 md:flex-col md:border-r md:border-border/20 md:bg-surface-container-low">
        <div className="px-8 py-8">
          <p className="font-serif text-2xl italic text-primary">Marquee Admin</p>
          <p className="mt-2 font-sans text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Small Town Theater
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4 pb-6">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface-container-high hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em]">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="md:pl-72">
        <header className="sticky top-0 z-30 border-b border-border/10 bg-background/90 backdrop-blur">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-serif text-2xl italic text-primary">
                  The Modern Marquee
                </p>
                <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-muted-foreground md:hidden">
                  Admin Navigation Below
                </p>
              </div>
              <div className="flex items-center gap-2">
                {userEmail ? (
                  <span className="hidden text-xs text-muted-foreground lg:inline">
                    {userEmail}
                  </span>
                ) : null}
                <Button variant="outline" size="icon-sm" type="button">
                  <Bell />
                </Button>
                <Button variant="outline" size="icon-sm" type="button">
                  <HelpCircle />
                </Button>
                <SignOutButton />
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
                <Input
                  className="pl-10"
                  placeholder="Search theaters, bookings, and titles..."
                />
              </div>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/admin/schedule/new">New Booking</Link>
              </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
              {navItems.map(({ href, label }) => {
                const active =
                  href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] whitespace-nowrap",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-container-high text-muted-foreground"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <AdminNotice />
          {children}
        </main>
      </div>
    </div>
  );
}
