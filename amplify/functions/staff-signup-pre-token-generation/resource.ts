import { defineFunction } from "@aws-amplify/backend";

export const staffSignupPreTokenGeneration = defineFunction({
  name: "staff-signup-pre-token-generation",
  entry: "./handler.ts",
  resourceGroupName: "auth",
  runtime: 20,
});
