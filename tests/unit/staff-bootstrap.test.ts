import { describe, expect, it } from "vitest";

import { createStaffInviteUrl } from "@/lib/auth/staff-invite";

describe("staff bootstrap invite URL", () => {
  it("builds a sign-up link with expected parameters", () => {
    const inviteUrl = new URL(
      createStaffInviteUrl({
        baseUrl: "https://theater.example",
        payload: {
          email: "staff@example.com",
          expiresAt: "2030-01-01T00:00:00.000Z",
        },
        secret: "top-secret",
      })
    );

    expect(inviteUrl.pathname).toBe("/admin/sign-up");
    expect(inviteUrl.searchParams.get("email")).toBe("staff@example.com");
    expect(inviteUrl.searchParams.get("expires")).toBe("2030-01-01T00:00:00.000Z");
    expect(inviteUrl.searchParams.get("role")).toBe("staff");
    expect(inviteUrl.searchParams.get("signature")).toBeTruthy();
  });
});
