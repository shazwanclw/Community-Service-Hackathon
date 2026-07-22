export function getFallbackHazardScore() {
  const totalPoints = Math.floor(Math.random() * 11) + 5;
  const sizeScore = Math.max(1, Math.floor(totalPoints / 3));
  const hazardScore = Math.max(1, Math.floor((totalPoints - sizeScore) / 2));
  const effortScore = totalPoints - sizeScore - hazardScore;

  return {
    size_score: sizeScore,
    hazard_score: hazardScore,
    effort_score: effortScore,
    total_points: totalPoints,
    point_status: "scored" as const,
    point_source: "fallback" as const,
    point_status_label: "Estimated by fallback scoring",
  };
}
