import { describe, expect, it } from "vitest";

import packageJson from "@/package.json";

describe("package.json", () => {
  it("pins jose for jwks-rsa to a CommonJS-compatible version", () => {
    expect(packageJson.overrides).toEqual({
      "jwks-rsa": {
        "jose": "4.15.9",
      },
    });
  });
});
