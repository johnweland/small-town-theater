"use client";

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";

import outputs from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";
import { createE2EAmplifyClient } from "@/lib/e2e/admin-mock-client";
import { isE2ETestMode } from "@/lib/e2e/config";

let configured = false;
let client: ReturnType<typeof generateClient<Schema>> | undefined;

export function ensureAmplifyConfigured() {
  if (!configured) {
    Amplify.configure(outputs, { ssr: true });
    configured = true;
  }
}

export function getAmplifyClient() {
  if (isE2ETestMode()) {
    return createE2EAmplifyClient() as unknown as ReturnType<
      typeof generateClient<Schema>
    >;
  }

  ensureAmplifyConfigured();
  client ??= generateClient<Schema>();
  return client;
}
