"use client";

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";

import outputs from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";

let configured = false;
let client: ReturnType<typeof generateClient<Schema>> | undefined;

export function ensureAmplifyConfigured() {
  if (!configured) {
    Amplify.configure(outputs, { ssr: true });
    configured = true;
  }
}

export function getAmplifyClient() {
  ensureAmplifyConfigured();
  client ??= generateClient<Schema>();
  return client;
}
