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

  return trimmed;
}

export function parseGeminiHazardScore(raw: string): HazardScore {
  const parsed = JSON.parse(extractJson(raw)) as Record<string, unknown>;

  const size = clampScore(Number(parsed.size_score));
  const hazard = clampScore(Number(parsed.hazard_score));
  const effort = clampScore(Number(parsed.effort_score));

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
