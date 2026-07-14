import { describe, expect, it } from "vitest";

import {
  getDisplayInitials,
  getDisplayName,
  getIssueGalleryMode,
  getIssueBeforePhotoUrls,
} from "@/lib/profile-display";

describe("profile display helpers", () => {
  it("prefers username over full name for display", () => {
    expect(
      getDisplayName({
        fullName: "Aina Rahman",
        username: "aina.rahman",
      }),
    ).toBe("aina.rahman");
  });

  it("falls back to full name and then email local part", () => {
    expect(getDisplayName({ fullName: "Aina Rahman" })).toBe("Aina Rahman");
    expect(getDisplayName({ email: "aina@example.com" })).toBe("aina");
  });

  it("builds initials from the resolved display name", () => {
    expect(getDisplayInitials({ fullName: "Aina Rahman" })).toBe("AR");
    expect(getDisplayInitials({ username: "aina.rahman" })).toBe("AR");
    expect(getDisplayInitials({ email: "aina@example.com" })).toBe("A");
  });

  it("normalizes old and new issue before-photo fields", () => {
    expect(
      getIssueBeforePhotoUrls({
        before_photo_url: "https://example.com/one.jpg",
      }),
    ).toEqual(["https://example.com/one.jpg"]);

    expect(
      getIssueBeforePhotoUrls({
        before_photo_url: "https://example.com/one.jpg",
        before_photo_urls: [
          "https://example.com/one.jpg",
          "https://example.com/two.jpg",
          "https://example.com/three.jpg",
        ],
      }),
    ).toEqual([
      "https://example.com/one.jpg",
      "https://example.com/two.jpg",
      "https://example.com/three.jpg",
    ]);
  });

  it("maps issue image counts to gallery layout modes", () => {
    expect(getIssueGalleryMode([])).toBe("empty");
    expect(getIssueGalleryMode(["one"])).toBe("single");
    expect(getIssueGalleryMode(["one", "two"])).toBe("double");
    expect(getIssueGalleryMode(["one", "two", "three"])).toBe("scroll");
  });
});
