import { describe, expect, it } from "vitest";

import { STAFF_INVITE_METADATA_KEYS } from "@/lib/auth/staff-invite-constants";
import {
  createStaffInviteUrl,
  createStaffInviteSignature,
  isStaffInviteExpired,
  readInvitePayloadFromClientMetadata,
  resolveInviteRole,
  verifyStaffInviteSignature,
  verifyStaffInvite,
} from "@/lib/auth/staff-invite";

describe("staff invite helpers", () => {
  it("normalizes email values when building invite URLs", () => {
    const url = new URL(
      createStaffInviteUrl({
        baseUrl: "https://theater.example",
        payload: {
          email: " Owner@Example.com ",
          expiresAt: "2030-01-01T00:00:00.000Z",
          role: "owner",
        },
        secret: "top-secret",
      })
    );

    expect(url.pathname).toBe("/admin/sign-up");
    expect(url.searchParams.get("email")).toBe("owner@example.com");
    expect(url.searchParams.get("role")).toBe("owner");
    expect(url.searchParams.get("signature")).toBeTruthy();
  });

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

  it.each([
    ["past expiration", "2020-01-01T00:00:00.000Z", new Date("2021-01-01T00:00:00.000Z"), true],
    ["exact expiration time", "2021-01-01T00:00:00.000Z", new Date("2021-01-01T00:00:00.000Z"), true],
    ["future expiration", "2030-01-01T00:00:00.000Z", new Date("2029-12-31T23:59:59.000Z"), false],
    ["invalid expiration", "not-a-date", new Date("2021-01-01T00:00:00.000Z"), true],
  ])("treats %s correctly", (_, expiresAt, now, expected) => {
    expect(isStaffInviteExpired(expiresAt, now)).toBe(expected);
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

  it("accepts a matching invite even when the provided email needs normalization", () => {
    const secret = "top-secret";
    const signature = createStaffInviteSignature(
      {
        email: "staff@example.com",
        expiresAt: "2030-01-01T00:00:00.000Z",
      },
      secret
    );

    expect(
      verifyStaffInvite({
        clientMetadata: {
          [STAFF_INVITE_METADATA_KEYS.email]: "STAFF@example.com ",
          [STAFF_INVITE_METADATA_KEYS.expiresAt]: "2030-01-01T00:00:00.000Z",
          [STAFF_INVITE_METADATA_KEYS.signature]: signature,
        },
        email: " Staff@Example.com ",
        secret,
      })
    ).toBe(true);
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

  it("defaults non-owner roles to staff", () => {
    expect(resolveInviteRole({ email: "staff@example.com", expiresAt: "2030-01-01T00:00:00.000Z" })).toBe(
      "staff"
    );
    expect(
      readInvitePayloadFromClientMetadata({
        [STAFF_INVITE_METADATA_KEYS.email]: " STAFF@example.com ",
        [STAFF_INVITE_METADATA_KEYS.expiresAt]: "2030-01-01T00:00:00.000Z",
        [STAFF_INVITE_METADATA_KEYS.role]: "manager",
      } as Record<string, string>)
    ).toEqual({
      email: "staff@example.com",
      expiresAt: "2030-01-01T00:00:00.000Z",
      role: "staff",
    });
  });

  it("preserves owner role when reading invite metadata", () => {
    expect(
      readInvitePayloadFromClientMetadata({
        [STAFF_INVITE_METADATA_KEYS.email]: "owner@example.com",
        [STAFF_INVITE_METADATA_KEYS.expiresAt]: "2030-01-01T00:00:00.000Z",
        [STAFF_INVITE_METADATA_KEYS.role]: "owner",
      })
    ).toEqual({
      email: "owner@example.com",
      expiresAt: "2030-01-01T00:00:00.000Z",
      role: "owner",
    });
  });

  it.each([
    ["missing metadata", undefined],
    ["missing email", { [STAFF_INVITE_METADATA_KEYS.expiresAt]: "2030-01-01T00:00:00.000Z" }],
    ["missing expiration", { [STAFF_INVITE_METADATA_KEYS.email]: "staff@example.com" }],
  ])("returns null when invite metadata has %s", (_, metadata) => {
    expect(readInvitePayloadFromClientMetadata(metadata as Record<string, string> | undefined)).toBeNull();
  });

  it("rejects signatures with different lengths without comparing them", () => {
    expect(
      verifyStaffInviteSignature(
        {
          email: "staff@example.com",
          expiresAt: "2030-01-01T00:00:00.000Z",
          role: "staff",
        },
        "short",
        "top-secret"
      )
    ).toBe(false);
  });

  it.each([
    [
      "missing payload metadata",
      {
        clientMetadata: {
          [STAFF_INVITE_METADATA_KEYS.signature]: "abc",
        },
        email: "staff@example.com",
        secret: "top-secret",
      },
    ],
    [
      "missing signature",
      {
        clientMetadata: {
          [STAFF_INVITE_METADATA_KEYS.email]: "staff@example.com",
          [STAFF_INVITE_METADATA_KEYS.expiresAt]: "2030-01-01T00:00:00.000Z",
        },
        email: "staff@example.com",
        secret: "top-secret",
      },
    ],
    [
      "expired invite",
      {
        clientMetadata: {
          [STAFF_INVITE_METADATA_KEYS.email]: "staff@example.com",
          [STAFF_INVITE_METADATA_KEYS.expiresAt]: "2020-01-01T00:00:00.000Z",
          [STAFF_INVITE_METADATA_KEYS.signature]: createStaffInviteSignature(
            {
              email: "staff@example.com",
              expiresAt: "2020-01-01T00:00:00.000Z",
            },
            "top-secret"
          ),
        },
        email: "staff@example.com",
        secret: "top-secret",
        now: new Date("2021-01-01T00:00:00.000Z"),
      },
    ],
  ])("rejects invites with %s", (_, input) => {
    expect(verifyStaffInvite(input)).toBe(false);
  });
});
