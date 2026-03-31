import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges duplicate Tailwind classes", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("ignores falsy values", () => {
    expect(cn("rounded-md", false && "hidden", undefined, "shadow-sm")).toBe(
      "rounded-md shadow-sm",
    );
  });
});
