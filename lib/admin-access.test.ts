import { describe, expect, it } from "vitest";

import { getAdminEmails, isAdminEmail } from "@/lib/admin-access";

describe("admin access helpers", () => {
  it("normalizes the allowlist", () => {
    expect(getAdminEmails(" One@Example.com, two@example.com ,, ")).toEqual([
      "one@example.com",
      "two@example.com",
    ]);
  });

  it("checks email access case-insensitively", () => {
    expect(
      isAdminEmail("ADMIN@example.com", "admin@example.com,other@example.com"),
    ).toBe(true);
    expect(isAdminEmail("guest@example.com", "admin@example.com")).toBe(false);
  });
});
