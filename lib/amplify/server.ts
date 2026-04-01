import { generateClient } from "aws-amplify/data/server";
import { runWithAmplifyServerContext, type AmplifyServer } from "aws-amplify/adapter-core";
import { parseAmplifyConfig } from "aws-amplify/utils";

import outputs from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";

const config = parseAmplifyConfig(outputs);
const client = generateClient<Schema>({ config });

export async function runAmplifyServerOperation<Result>(
  operation: (contextSpec: AmplifyServer.ContextSpec) => Result | Promise<Result>
) {
  return runWithAmplifyServerContext(config, {}, operation);
}

export async function listTheatersFromAmplify() {
  return runAmplifyServerOperation((contextSpec) =>
    client.models.Theater.list(contextSpec, {
      authMode: "apiKey",
      sortDirection: "ASC",
    })
  );
}

export async function getTheaterFromAmplify(theaterId: string) {
  return runAmplifyServerOperation((contextSpec) =>
    client.models.Theater.get(contextSpec, { id: theaterId }, { authMode: "apiKey" })
  );
}
