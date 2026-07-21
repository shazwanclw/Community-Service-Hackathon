import { describe, expect, it, vi } from "vitest";

describe("firebase-admin helper", () => {
  it("can be imported even when firebase-admin/app throws during module load", async () => {
    vi.resetModules();
    vi.doMock("server-only", () => ({}), { virtual: true });
    vi.doMock("firebase-admin/app", () => {
      throw new Error("firebase-admin/app import failed");
    });

    await expect(import("@/lib/firebase-admin")).resolves.toBeTruthy();

    vi.doUnmock("server-only");
    vi.doUnmock("firebase-admin/app");
    vi.resetModules();
  });
});
