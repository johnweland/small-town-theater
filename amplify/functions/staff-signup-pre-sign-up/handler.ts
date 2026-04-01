import { createHmac } from "node:crypto";

import type { PreSignUpTriggerHandler } from "aws-lambda";

import { STAFF_INVITE_METADATA_KEYS } from "../../../lib/auth/staff-invite-constants";
import {
  createStaffInviteSignature,
  isStaffInviteExpired,
  readInvitePayloadFromClientMetadata,
  verifyStaffInviteSignature,
} from "../../../lib/auth/staff-invite";

function secretFingerprint(secret: string) {
  return createHmac("sha256", secret).update("fingerprint").digest("hex").slice(0, 8);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const handler: PreSignUpTriggerHandler = async (event) => {
  const secret = process.env.STAFF_SIGNUP_SECRET;

  if (!secret) {
    throw new Error("Missing STAFF_SIGNUP_SECRET.");
  }

  const email = event.request.userAttributes.email ?? event.userName;
  const clientMetadata = {
    ...event.request.validationData,
    ...event.request.clientMetadata,
  };

  const payload = readInvitePayloadFromClientMetadata(clientMetadata);
  const signature = clientMetadata[STAFF_INVITE_METADATA_KEYS.signature];

  if (!payload || !signature) {
    throw new Error(
      "No invite metadata found in signUp request. Ensure the sign-up form passes staffInviteEmail, staffInviteExpiresAt, and staffInviteSignature in clientMetadata."
    );
  }

  if (payload.email !== normalizeEmail(email)) {
    throw new Error("Invite email does not match the signing-up user.");
  }

  if (isStaffInviteExpired(payload.expiresAt)) {
    throw new Error(
      `Staff invite has expired. (expiresAt=${payload.expiresAt}, now=${new Date().toISOString()})`
    );
  }

  if (!verifyStaffInviteSignature(payload, signature, secret)) {
    const lambdaFp = secretFingerprint(secret);
    const expectedSig = createStaffInviteSignature(payload, secret);
    console.error(
      "[PreSignUp] Signature mismatch diagnostics:",
      JSON.stringify({
        lambdaSecretFingerprint: lambdaFp,
        payloadUsed: `${payload.email}:${payload.expiresAt}`,
        expectedSignature: expectedSig,
        receivedSignature: signature,
      })
    );
    throw new Error(
      `Invite signature verification failed. Lambda secret fingerprint: ${lambdaFp}. This usually means STAFF_SIGNUP_SECRET differs between Next.js (.env.local) and the Lambda (Amplify secret store). Re-run: npx ampx sandbox secret set STAFF_SIGNUP_SECRET`
    );
  }

  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  event.response.autoVerifyPhone = false;

  return event;
};
