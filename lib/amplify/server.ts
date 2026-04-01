import { generateClient } from "aws-amplify/data/server";
import { parseAmplifyConfig } from "aws-amplify/utils";

import outputs from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";
import { runWithAuthServerContext } from "@/lib/auth/server";

const config = parseAmplifyConfig(outputs);
const client = generateClient<Schema>({ config });

export async function listTheatersFromAmplify() {
  return runWithAuthServerContext((contextSpec) =>
    client.models.Theater.list(contextSpec, {
      authMode: "userPool",
      sortDirection: "ASC",
    })
  );
}

export async function getTheaterFromAmplify(theaterId: string) {
  return runWithAuthServerContext((contextSpec) =>
    client.models.Theater.get(contextSpec, { id: theaterId }, { authMode: "userPool" })
  );
}

export async function listScreensFromAmplify(theaterId?: string) {
  return runWithAuthServerContext((contextSpec) =>
    theaterId
      ? client.models.Screen.listScreensByTheater(
          contextSpec,
          { theaterId },
          { authMode: "userPool" }
        )
      : client.models.Screen.list(contextSpec, {
          authMode: "userPool",
          sortDirection: "ASC",
        })
  );
}

export async function getScreenFromAmplify(screenId: string) {
  return runWithAuthServerContext((contextSpec) =>
    client.models.Screen.get(contextSpec, { id: screenId }, { authMode: "userPool" })
  );
}
