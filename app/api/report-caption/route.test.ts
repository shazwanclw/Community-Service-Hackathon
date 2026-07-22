import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/gemini", () => ({
  generateHazardCaption: vi.fn(),
}));

import { POST } from "@/app/api/report-caption/route";
import { generateHazardCaption } from "@/lib/gemini";

describe("POST /api/report-caption", () => {
  it("returns the generated caption when captioning succeeds", async () => {
    vi.mocked(generateHazardCaption).mockResolvedValueOnce(
      "Overflowing rubbish is blocking the walkway and may attract pests. This should be cleared soon to keep the area safe and usable.",
    );

    const response = await POST(
      new Request("http://localhost/api/report-caption", {
        method: "POST",
        body: JSON.stringify({
          imageBase64: "abc123",
          mimeType: "image/jpeg",
          location: "Block C",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      caption:
        "Overflowing rubbish is blocking the walkway and may attract pests. This should be cleared soon to keep the area safe and usable.",
    });
  });

  it("returns a clear message when the image cannot be captioned", async () => {
    vi.mocked(generateHazardCaption).mockResolvedValueOnce("Image not clear.");

    const response = await POST(
      new Request("http://localhost/api/report-caption", {
        method: "POST",
        body: JSON.stringify({
          imageBase64: "abc123",
          mimeType: "image/jpeg",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      caption: "There is an issue visible in this area. Please check and fix it.",
    });
  });

  it("returns a simple fallback caption when caption generation throws", async () => {
    vi.mocked(generateHazardCaption).mockRejectedValueOnce(
      new Error("Failed to generate the report caption."),
    );

    const response = await POST(
      new Request("http://localhost/api/report-caption", {
        method: "POST",
        body: JSON.stringify({
          imageBase64: "abc123",
          mimeType: "image/jpeg",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      caption: "There is an issue visible in this area. Please check and fix it.",
    });
  });
});
