import { describe, expect, it } from "vitest";

import { getAuthErrorMessage } from "@/lib/auth-error";

describe("getAuthErrorMessage", () => {
  it("maps invalid login credentials to a plain message", () => {
    expect(
      getAuthErrorMessage(
        new Error("Firebase: Error (auth/invalid-credential)."),
        "login",
      ),
    ).toBe("Email or password is wrong.");
  });

  it("maps wrong-password login errors to the same plain message", () => {
    expect(
      getAuthErrorMessage(
        new Error("Firebase: Error (auth/wrong-password)."),
        "login",
      ),
    ).toBe("Email or password is wrong.");
  });

  it("keeps a generic fallback for unknown auth failures", () => {
    expect(getAuthErrorMessage(new Error("Unexpected failure"), "signup")).toBe(
      "Authentication failed.",
    );
  });
});
