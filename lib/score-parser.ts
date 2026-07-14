import { HazardScore } from "@/lib/types";

const SCORE_MIN = 1;
const SCORE_MAX = 10;

function clampScore(value: number) {
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, Math.round(value)));
}

function extractJson(raw: string) {
  const trimmed = raw.trim();

  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  }

  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");

  if (objectStart >= 0 && objectEnd > objectStart) {
    return trimmed.slice(objectStart, objectEnd + 1);
  }

  return trimmed;
}

function readScore(
  parsed: Record<string, unknown>,
  ...keys: string[]
) {
  for (const key of keys) {
    const value = Number(parsed[key]);

    if (!Number.isNaN(value)) {
      return clampScore(value);
    }
  }

  return Number.NaN;
}

export function parseGeminiHazardScore(raw: string): HazardScore {
  const parsed = JSON.parse(extractJson(raw)) as Record<string, unknown>;

  const size = readScore(parsed, "size_score", "sizeScore", "size");
  const hazard = readScore(parsed, "hazard_score", "hazardScore", "hazard");
  const effort = readScore(parsed, "effort_score", "effortScore", "effort");

  if ([size, hazard, effort].some((value) => Number.isNaN(value))) {
    throw new Error("Gemini response is missing hazard scores.");
  }

  const computedTotal = size + hazard + effort;

  return {
    size_score: size,
    hazard_score: hazard,
    effort_score: effort,
    total_points: computedTotal,
  };
}
