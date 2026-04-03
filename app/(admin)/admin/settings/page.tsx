import Link from "next/link";
import { Crown, MailPlus, Trash2, UserRound } from "lucide-react";

import { removeStaffUserAction, setStaffOwnerStatusAction } from "@/app/(admin)/admin/settings/actions";
import { AdminDataTable } from "@/components/admin/data-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSectionCard } from "@/components/admin/section-card";
import { StaffInviteForm } from "@/components/admin/staff-invite-form";
import { Button } from "@/components/ui/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStaffSession, listStaffUsers } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [session, staffUsers] = await Promise.all([
    getStaffSession(),
    listStaffUsers(),
  ]);
  const currentEmail = session.email?.trim().toLowerCase();
  const ownerExists = staffUsers.some((user) => user.isOwner);
  const canManageOwners = session.isOwner || !ownerExists;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Settings"
        title="Admin settings"
        description="Manage staff access and the account controls that keep the admin workspace secure."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,0.65fr)]">
        <div className="flex flex-col gap-6">
          <AdminSectionCard
            title="Invite staff"
            description="Create temporary signup links for new staff members without using the bootstrap secret."
            action={
              <div className="rounded-lg bg-surface-container-high p-3 text-primary">
                <MailPlus className="size-5" />
              </div>
            }
          >
            <StaffInviteForm />
          </AdminSectionCard>

          <AdminSectionCard
            title="Staff access"
            description="Review current staff accounts, remove former employees, and manage elevated owner access."
          >
            {staffUsers.length > 0 ? (
              <AdminDataTable>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffUsers.map((user) => {
                    const removeAction = removeStaffUserAction.bind(null, user.username);
                    const makeOwnerAction = setStaffOwnerStatusAction.bind(null, user.username, true);
                    const removeOwnerAction = setStaffOwnerStatusAction.bind(null, user.username, false);
                    const isCurrentUser =
                      Boolean(currentEmail) &&
                      currentEmail === (user.email ?? user.username).trim().toLowerCase();
                    const isLastOwner =
                      user.isOwner && staffUsers.filter((member) => member.isOwner).length <= 1;

                    return (
                      <TableRow key={user.username}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <p className="font-semibold text-foreground">
                              {user.displayName?.trim() || user.email || user.username}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email || user.username}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-foreground">
                            {user.isOwner ? "Owner" : "Staff"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-foreground">
                              {user.enabled ? "Active" : "Disabled"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {user.status || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {user.isOwner ? (
                              <form action={removeOwnerAction}>
                                <Button
                                  type="submit"
                                  variant="outline"
                                  size="icon-sm"
                                  disabled={!canManageOwners || isLastOwner}
                                  title={isLastOwner ? "Cannot demote the last owner" : "Demote from owner"}
                                  aria-label={isLastOwner ? "Cannot demote the last owner" : "Demote from owner"}
                                >
                                  <Crown />
                                </Button>
                              </form>
                            ) : (
                              <form action={makeOwnerAction}>
                                <Button
                                  type="submit"
                                  variant="outline"
                                  size="icon-sm"
                                  disabled={!canManageOwners}
                                  title="Promote to owner"
                                  aria-label="Promote to owner"
                                >
                                  <Crown />
                                </Button>
                              </form>
                            )}
                            <form action={removeAction}>
                              <Button
                                type="submit"
                                variant="destructive"
                                size="icon-sm"
                                disabled={!canManageOwners || isCurrentUser || isLastOwner}
                                title={
                                  isCurrentUser
                                    ? "Cannot remove the account you are using"
                                    : isLastOwner
                                      ? "Cannot remove the last owner"
                                      : "Remove user"
                                }
                                aria-label={
                                  isCurrentUser
                                    ? "Cannot remove the account you are using"
                                    : isLastOwner
                                      ? "Cannot remove the last owner"
                                      : "Remove user"
                                }
                              >
                                <Trash2 />
                              </Button>
                            </form>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </AdminDataTable>
            ) : (
              <div className="rounded-xl bg-surface-container-high p-5 text-sm text-muted-foreground">
                No staff users were found in the admin user pool.
              </div>
            )}
          </AdminSectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <AdminSectionCard
            title="Your account"
            description="Manage your profile, security, and active sessions."
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/account">Open account</Link>
              </Button>
            }
          >
            <div className="flex items-center gap-3 rounded-xl bg-surface-container-high p-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <UserRound className="size-5" />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Update your avatar, reset your password, and review your sign-in protections.
              </p>
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: Date | null) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}
