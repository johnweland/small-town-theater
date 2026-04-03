import { describe, expect, it } from "vitest";

import { STAFF_INVITE_METADATA_KEYS } from "@/lib/auth/staff-invite-constants";
import {
  createStaffInviteSignature,
  isStaffInviteExpired,
  verifyStaffInvite,
} from "@/lib/auth/staff-invite";

describe("staff invite helpers", () => {
  it("accepts a valid invite", () => {
    const secret = "top-secret";
    const email = "staff@example.com";
    const expiresAt = "2030-01-01T00:00:00.000Z";
    const signature = createStaffInviteSignature({ email, expiresAt, role: "staff" }, secret);

    expect(
      verifyStaffInvite({
        clientMetadata: {
          [STAFF_INVITE_METADATA_KEYS.email]: email,
          [STAFF_INVITE_METADATA_KEYS.expiresAt]: expiresAt,
          [STAFF_INVITE_METADATA_KEYS.role]: "staff",
          [STAFF_INVITE_METADATA_KEYS.signature]: signature,
        },
        email,
        secret,
      })
    ).toBe(true);
  });

  it("rejects an expired invite", () => {
    expect(
      isStaffInviteExpired("2020-01-01T00:00:00.000Z", new Date("2021-01-01T00:00:00.000Z"))
    ).toBe(true);
  });

  it("rejects a mismatched email", () => {
    const secret = "top-secret";
    const signature = createStaffInviteSignature(
      {
        email: "staff@example.com",
        expiresAt: "2030-01-01T00:00:00.000Z",
        role: "staff",
      },
      secret
    );

    expect(
      verifyStaffInvite({
        clientMetadata: {
          [STAFF_INVITE_METADATA_KEYS.email]: "staff@example.com",
          [STAFF_INVITE_METADATA_KEYS.expiresAt]: "2030-01-01T00:00:00.000Z",
          [STAFF_INVITE_METADATA_KEYS.role]: "staff",
          [STAFF_INVITE_METADATA_KEYS.signature]: signature,
        },
        email: "other@example.com",
        secret,
      })
    ).toBe(false);
  });

  it("distinguishes owner invites from regular staff invites", () => {
    const secret = "top-secret";
    const email = "owner@example.com";
    const expiresAt = "2030-01-01T00:00:00.000Z";
    const ownerSignature = createStaffInviteSignature(
      { email, expiresAt, role: "owner" },
      secret
    );

    expect(
      verifyStaffInvite({
        clientMetadata: {
          [STAFF_INVITE_METADATA_KEYS.email]: email,
          [STAFF_INVITE_METADATA_KEYS.expiresAt]: expiresAt,
          [STAFF_INVITE_METADATA_KEYS.role]: "staff",
          [STAFF_INVITE_METADATA_KEYS.signature]: ownerSignature,
        },
        email,
        secret,
      })
    ).toBe(false);
  });
});
