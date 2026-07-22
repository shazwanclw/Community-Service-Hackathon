import { describe, expect, it } from "vitest";

import {
  buildHazardScoreRequest,
  getCaptionFallbackText,
  normalizeCaptionErrorMessage,
} from "@/lib/report-ai";

describe("report AI helpers", () => {
  it("prefers an uploaded image URL for hazard scoring", () => {
    expect(
      buildHazardScoreRequest({
        uploadedImageUrl: "https://example.com/uploaded.jpg",
        imageBase64: "abc123",
        mimeType: "image/jpeg",
      }),
    ).toEqual({
      imageUrl: "https://example.com/uploaded.jpg",
    });
  });

  it("falls back to base64 when no uploaded image URL is available", () => {
    expect(
      buildHazardScoreRequest({
        imageBase64: "abc123",
        mimeType: "image/jpeg",
      }),
    ).toEqual({
      imageBase64: "abc123",
      mimeType: "image/jpeg",
    });
  });

  it("normalizes unclear caption failures to the user-facing message", () => {
    expect(normalizeCaptionErrorMessage("AI caption generation failed.")).toBe(
      "Image is not clear for AI to give caption.",
    );
    expect(normalizeCaptionErrorMessage("Failed to generate the report caption.")).toBe(
      "Image is not clear for AI to give caption.",
    );
    expect(normalizeCaptionErrorMessage("Image not clear.")).toBe(
      "Image is not clear for AI to give caption.",
    );
  });

  it("returns the generic caption fallback when no caption text is available", () => {
    expect(getCaptionFallbackText()).toBe(
      "There is an issue visible in this area. Please check and fix it.",
    );
    expect(getCaptionFallbackText("")).toBe(
      "There is an issue visible in this area. Please check and fix it.",
    );
  });
});
