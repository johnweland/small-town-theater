import { createHmac, timingSafeEqual } from "node:crypto";

import { STAFF_INVITE_METADATA_KEYS } from "./staff-invite-constants";

export type StaffInviteTokenPayload = {
  email: string;
  expiresAt: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createPayloadString({ email, expiresAt }: StaffInviteTokenPayload) {
  return `${normalizeEmail(email)}:${expiresAt}`;
}

export function createStaffInviteSignature(
  payload: StaffInviteTokenPayload,
  secret: string
) {
  return createHmac("sha256", secret)
    .update(createPayloadString(payload))
    .digest("base64url");
}

export function createStaffInviteUrl({
  baseUrl,
  payload,
  secret,
}: {
  baseUrl: string;
  payload: StaffInviteTokenPayload;
  secret: string;
}) {
  const inviteUrl = new URL("/admin/sign-up", baseUrl);
  const signature = createStaffInviteSignature(payload, secret);

  inviteUrl.searchParams.set("email", normalizeEmail(payload.email));
  inviteUrl.searchParams.set("expires", payload.expiresAt);
  inviteUrl.searchParams.set("signature", signature);

  return inviteUrl.toString();
}

export function verifyStaffInviteSignature(
  payload: StaffInviteTokenPayload,
  signature: string,
  secret: string
) {
  const expected = createStaffInviteSignature(payload, secret);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export function isStaffInviteExpired(expiresAt: string, now = new Date()) {
  const expiresAtDate = new Date(expiresAt);

  if (Number.isNaN(expiresAtDate.getTime())) {
    return true;
  }

  return expiresAtDate.getTime() <= now.getTime();
}

export function readInvitePayloadFromClientMetadata(
  clientMetadata: Record<string, string> | undefined
): StaffInviteTokenPayload | null {
  if (!clientMetadata) {
    return null;
  }

  const email = clientMetadata[STAFF_INVITE_METADATA_KEYS.email];
  const expiresAt = clientMetadata[STAFF_INVITE_METADATA_KEYS.expiresAt];

  if (!email || !expiresAt) {
    return null;
  }

  return {
    email: normalizeEmail(email),
    expiresAt,
  };
}

export function verifyStaffInvite({
  clientMetadata,
  email,
  secret,
  now,
}: {
  clientMetadata: Record<string, string> | undefined;
  email: string;
  now?: Date;
  secret: string;
}) {
  const payload = readInvitePayloadFromClientMetadata(clientMetadata);
  const signature = clientMetadata?.[STAFF_INVITE_METADATA_KEYS.signature];

  if (!payload || !signature) {
    return false;
  }

  if (payload.email !== normalizeEmail(email)) {
    return false;
  }

  if (isStaffInviteExpired(payload.expiresAt, now)) {
    return false;
  }

  return verifyStaffInviteSignature(payload, signature, secret);
}
