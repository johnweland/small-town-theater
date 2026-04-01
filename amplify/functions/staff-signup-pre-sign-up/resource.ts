import { defineFunction, secret } from "@aws-amplify/backend";

export const staffSignupPreSignUp = defineFunction({
  name: "staff-signup-pre-sign-up",
  entry: "./handler.ts",
  environment: {
    STAFF_SIGNUP_SECRET: secret("STAFF_SIGNUP_SECRET"),
  },
  resourceGroupName: "auth",
  runtime: 20,
});
