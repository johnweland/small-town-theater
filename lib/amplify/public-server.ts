import { generateClient } from "aws-amplify/data/server";
import { runWithAmplifyServerContext } from "aws-amplify/adapter-core";
import { parseAmplifyConfig } from "aws-amplify/utils";

import outputs from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";

const config = parseAmplifyConfig(outputs);
const client = generateClient<Schema>({ config });
const publicTheaterSelection = [
  "id",
  "slug",
  "name",
  "city",
  "state",
  "district",
  "established",
  "status",
  "address",
  "phone",
  "contactEmail",
  "manager",
  "heroImage",
  "descriptionParagraphs",
  "createdAt",
  "updatedAt",
] as const;
const publicScreenSelection = [
  "id",
  "theaterId",
  "name",
  "slug",
  "capacity",
  "sortOrder",
  "projection",
  "soundFormat",
  "features",
  "status",
  "createdAt",
  "updatedAt",
] as const;

export async function listPublicTheatersFromAmplify() {
  return runWithAmplifyServerContext(config, {}, (contextSpec) =>
    client.models.Theater.list(contextSpec, {
      authMode: "apiKey",
      sortDirection: "ASC",
      selectionSet: publicTheaterSelection,
    })
  );
}

export async function listPublicScreensFromAmplify(theaterId: string) {
  return runWithAmplifyServerContext(config, {}, (contextSpec) =>
    client.models.Screen.listScreensByTheater(
      contextSpec,
      { theaterId },
      {
        authMode: "apiKey",
        selectionSet: publicScreenSelection,
      }
    )
  );
}
