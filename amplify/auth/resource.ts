import { defineAuth } from "@aws-amplify/backend";

import { staffSignupPreSignUp } from "../functions/staff-signup-pre-sign-up/resource";
import { staffSignupPreTokenGeneration } from "../functions/staff-signup-pre-token-generation/resource";

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ["ADMINS"],
  userAttributes: {
    "custom:isAdminStaff": {
      dataType: "String",
      mutable: false,
    },
  },
  triggers: {
    preSignUp: staffSignupPreSignUp,
    preTokenGeneration: staffSignupPreTokenGeneration,
  },
});
