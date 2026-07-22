import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/gemini", () => ({
  analyzeHazardImage: vi.fn(),
}));

import { POST } from "@/app/api/score-hazard/route";
import { analyzeHazardImage } from "@/lib/gemini";

describe("POST /api/score-hazard", () => {
  it("returns the Gemini score when analysis succeeds", async () => {
    vi.mocked(analyzeHazardImage).mockResolvedValueOnce({
      size_score: 4,
      hazard_score: 5,
      effort_score: 6,
      total_points: 15,
    });

    const response = await POST(
      new Request("http://localhost/api/score-hazard", {
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
      size_score: 4,
      hazard_score: 5,
      effort_score: 6,
      total_points: 15,
      point_status: "scored",
      point_source: "ai",
      point_status_label: null,
    });
  });

  it("returns the fallback score when analysis fails", async () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0);
    vi.mocked(analyzeHazardImage).mockRejectedValueOnce(
      new Error("GEMINI_API_KEY is not configured."),
    );

    const response = await POST(
      new Request("http://localhost/api/score-hazard", {
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
      size_score: 1,
      hazard_score: 2,
      effort_score: 2,
      total_points: 5,
      point_status: "scored",
      point_source: "fallback",
      point_status_label: "Estimated by fallback scoring",
    });
  });

  it("rejects requests without image content", async () => {
    const response = await POST(
      new Request("http://localhost/api/score-hazard", {
        method: "POST",
        body: JSON.stringify({}),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "imageBase64 or imageUrl is required.",
    });
  });
});
