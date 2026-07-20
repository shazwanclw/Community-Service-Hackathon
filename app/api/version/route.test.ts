import { afterEach, describe, expect, it } from "vitest";

describe("GET /api/version", () => {
  const originalCommitSha = process.env.VERCEL_GIT_COMMIT_SHA;
  const originalBranch = process.env.VERCEL_GIT_COMMIT_REF;

  afterEach(() => {
    process.env.VERCEL_GIT_COMMIT_SHA = originalCommitSha;
    process.env.VERCEL_GIT_COMMIT_REF = originalBranch;
  });

  it("returns the deployed commit metadata when available", async () => {
    process.env.VERCEL_GIT_COMMIT_SHA = "a2ad16fabcd1234";
    process.env.VERCEL_GIT_COMMIT_REF = "main";

    const { GET } = await import("@/app/api/version/route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      branch: "main",
      commit: "a2ad16f",
      environment: "local",
    });
  });

  it("falls back to local metadata when no Vercel commit is present", async () => {
    delete process.env.VERCEL_GIT_COMMIT_SHA;
    delete process.env.VERCEL_GIT_COMMIT_REF;

    const { GET } = await import("@/app/api/version/route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      branch: null,
      commit: "local",
      environment: "local",
    });
  });
});
