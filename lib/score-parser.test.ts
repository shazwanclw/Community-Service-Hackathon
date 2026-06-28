import { describe, expect, it } from "vitest";

import { parseGeminiHazardScore } from "@/lib/score-parser";

describe("parseGeminiHazardScore", () => {
  it("parses a plain JSON payload", () => {
    expect(
      parseGeminiHazardScore(
        '{"size_score":4,"hazard_score":5,"effort_score":6,"total_points":15}',
      ),
    ).toEqual({
      size_score: 4,
      hazard_score: 5,
      effort_score: 6,
      total_points: 15,
    });
  });

  it("parses fenced JSON and recomputes the total", () => {
    expect(
      parseGeminiHazardScore(`\`\`\`json
{"size_score":7,"hazard_score":3,"effort_score":2,"total_points":999}
\`\`\``),
    ).toEqual({
      size_score: 7,
      hazard_score: 3,
      effort_score: 2,
      total_points: 12,
    });
  });

  it("clamps scores to the supported range", () => {
    expect(
      parseGeminiHazardScore(
        '{"size_score":14,"hazard_score":0,"effort_score":8,"total_points":22}',
      ),
    ).toEqual({
      size_score: 10,
      hazard_score: 1,
      effort_score: 8,
      total_points: 19,
    });
  });

  it("throws on invalid payloads", () => {
    expect(() => parseGeminiHazardScore('{"size_score":"oops"}')).toThrow();
  });
});
