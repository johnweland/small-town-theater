import type { PreSignUpTriggerHandler } from "aws-lambda";

import { verifyStaffInvite } from "../../../lib/auth/staff-invite";

export const handler: PreSignUpTriggerHandler = async (event) => {
  const secret = process.env.STAFF_SIGNUP_SECRET;

  if (!secret) {
    throw new Error("Missing STAFF_SIGNUP_SECRET.");
  }

  const email = event.request.userAttributes.email ?? event.userName;
  const isValidInvite = verifyStaffInvite({
    clientMetadata: {
      ...event.request.validationData,
      ...event.request.clientMetadata,
    },
    email,
    secret,
  });

  if (!isValidInvite) {
    throw new Error("This staff invite link is invalid or has expired.");
  }

  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  event.response.autoVerifyPhone = false;

  return event;
};
