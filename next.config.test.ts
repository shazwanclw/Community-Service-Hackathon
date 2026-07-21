import { describe, expect, it } from "vitest";

import nextConfig from "@/next.config";

describe("next config", () => {
  it("does not force firebase-admin as a server external package", () => {
    expect(nextConfig.serverExternalPackages).toBeUndefined();
  });
});
