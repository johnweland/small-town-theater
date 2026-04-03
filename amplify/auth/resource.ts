import { defineAuth } from "@aws-amplify/backend";

import { staffSignupPreSignUp } from "../functions/staff-signup-pre-sign-up/resource";
import { staffSignupPreTokenGeneration } from "../functions/staff-signup-pre-token-generation/resource";

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  accountRecovery: "EMAIL_ONLY",
  groups: ["ADMINS", "OWNERS"],
  multifactor: {
    mode: "OPTIONAL",
    totp: true,
  },
  userAttributes: {
    "custom:isAdminStaff": {
      dataType: "String",
      mutable: false,
    },
    "custom:isOwner": {
      dataType: "String",
      mutable: true,
    },
  },
  triggers: {
    preSignUp: staffSignupPreSignUp,
    preTokenGeneration: staffSignupPreTokenGeneration,
  },
});
