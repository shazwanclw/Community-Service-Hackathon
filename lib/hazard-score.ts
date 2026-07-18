export const FALLBACK_HAZARD_SCORE = {
  size_score: 3,
  hazard_score: 3,
  effort_score: 3,
  total_points: 9,
  point_status: "pending_admin_review",
  point_source: "fallback",
  point_status_label: "Waiting for admin points",
} as const;

export function getFallbackHazardScore() {
  return { ...FALLBACK_HAZARD_SCORE };
}
