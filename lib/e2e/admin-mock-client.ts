"use client";

import type { MockModelName } from "./admin-mock-store";

type MockResult = {
  data: Record<string, unknown> | Record<string, unknown>[] | null;
  errors?: { message: string }[];
};

async function callMockApi(input: {
  action: "reset" | "list" | "get" | "create" | "update" | "delete";
  model?: MockModelName;
  id?: string;
  params?: Record<string, unknown>;
  payload?: Record<string, unknown>;
}): Promise<MockResult> {
  const response = await fetch("/api/e2e/mock", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return (await response.json()) as MockResult;
}

function createSubscription() {
  return {
    subscribe() {
      return {
        unsubscribe() {},
      };
    },
  };
}

function createModel(model: MockModelName) {
  return {
    list(_: Record<string, unknown> = {}, params?: Record<string, unknown>) {
      return callMockApi({ action: "list", model, params });
    },
    get(payload: { id: string }) {
      return callMockApi({ action: "get", model, id: payload.id });
    },
    create(payload: Record<string, unknown>) {
      return callMockApi({ action: "create", model, payload });
    },
    update(payload: Record<string, unknown>) {
      return callMockApi({ action: "update", model, payload });
    },
    delete(payload: { id: string }) {
      return callMockApi({ action: "delete", model, id: payload.id });
    },
    onCreate() {
      return createSubscription();
    },
    onUpdate() {
      return createSubscription();
    },
    onDelete() {
      return createSubscription();
    },
  };
}

export function createE2EAmplifyClient() {
  return {
    models: {
      Theater: createModel("Theater"),
      Screen: {
        ...createModel("Screen"),
        listScreensByTheater(_: Record<string, unknown>, params: { theaterId: string }) {
          return callMockApi({
            action: "list",
            model: "Screen",
            params: { theaterId: params.theaterId },
          });
        },
      },
      Movie: createModel("Movie"),
      VenueItem: createModel("VenueItem"),
      VenueItemAvailability: createModel("VenueItemAvailability"),
    },
  };
}
