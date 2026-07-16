export const FALLBACK_HAZARD_SCORE = {
  size_score: 3,
  hazard_score: 3,
  effort_score: 3,
  total_points: 9,
} as const;

export function getFallbackHazardScore() {
  return { ...FALLBACK_HAZARD_SCORE };
}
