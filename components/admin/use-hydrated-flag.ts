"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useHydratedFlag() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
