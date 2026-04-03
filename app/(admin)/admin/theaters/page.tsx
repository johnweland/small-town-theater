import Link from "next/link";

import { getAdminTheaters } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminDataTable } from "@/components/admin/data-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminStatusBadge } from "@/components/admin/status-badge";

export default async function AdminTheatersPage() {
  const theaters = await getAdminTheaters();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Venues"
        title="Theater management"
        description="Manage locations, keep their operational details current, and jump into each house's screens and programming."
        action={
          <Button asChild>
            <Link href="/admin/theaters/new">Add Theater</Link>
          </Button>
        }
      />

      <AdminDataTable>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Established</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {theaters.length ? (
            theaters.map((theater) => (
              <TableRow key={theater.id}>
                <TableCell>
                  <div>
                    <p className="font-serif text-2xl italic text-foreground">
                      {theater.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{theater.address}</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {theater.slug}
                </TableCell>
                <TableCell>{theater.city}</TableCell>
                <TableCell>
                  <AdminStatusBadge status={theater.status} />
                </TableCell>
                <TableCell>{theater.established || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline">
                    <Link href={`/admin/theaters/${theater.id}`}>Open</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No theaters found yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </AdminDataTable>
    </div>
  );
}
