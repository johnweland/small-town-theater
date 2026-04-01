"use server";

import { createHmac } from "node:crypto";

import { headers } from "next/headers";

import { createStaffInviteUrl } from "@/lib/auth/staff-invite";

export type BootstrapInviteState = {
  email?: string;
  expiresInHours?: number;
  inviteUrl?: string;
  error?: string;
};

function getBaseUrlFromHeaders(headersList: Awaited<ReturnType<typeof headers>>) {
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");

  if (!host) {
    return null;
  }

  const protocol =
    headersList.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");

  return `${protocol}://${host}`;
}

export async function createBootstrapInviteAction(
  _previousState: BootstrapInviteState,
  formData: FormData
): Promise<BootstrapInviteState> {
  const bootstrapSecret = String(formData.get("bootstrapSecret") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const expiresInHours = Number(String(formData.get("expiresInHours") ?? "24"));

  if (!process.env.ADMIN_BOOTSTRAP_SECRET) {
    return {
      email,
      expiresInHours,
      error: "ADMIN_BOOTSTRAP_SECRET is not configured on the server.",
    };
  }

  if (bootstrapSecret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
    return {
      email,
      expiresInHours,
      error: "The bootstrap secret was incorrect.",
    };
  }

  if (!process.env.STAFF_SIGNUP_SECRET) {
    return {
      email,
      expiresInHours,
      error: "STAFF_SIGNUP_SECRET is not configured on the server.",
    };
  }

  if (!email || !email.includes("@")) {
    return {
      email,
      expiresInHours,
      error: "Enter a valid email address.",
    };
  }

  if (!Number.isFinite(expiresInHours) || expiresInHours <= 0 || expiresInHours > 168) {
    return {
      email,
      expiresInHours,
      error: "Expiry must be between 1 and 168 hours.",
    };
  }

  const baseUrl = getBaseUrlFromHeaders(await headers());

  if (!baseUrl) {
    return {
      email,
      expiresInHours,
      error: "Could not determine the application URL for this request.",
    };
  }

  const expiresAt = new Date(
    Date.now() + expiresInHours * 60 * 60 * 1000
  ).toISOString();

  const signupSecret = process.env.STAFF_SIGNUP_SECRET;
  const fp = createHmac("sha256", signupSecret).update("fingerprint").digest("hex").slice(0, 8);
  console.log(`[Bootstrap] STAFF_SIGNUP_SECRET fingerprint: ${fp}`);

  return {
    email,
    expiresInHours,
    inviteUrl: createStaffInviteUrl({
      baseUrl,
      payload: {
        email,
        expiresAt,
      },
      secret: signupSecret,
    }),
  };
}
