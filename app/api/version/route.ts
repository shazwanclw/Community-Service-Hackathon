function getShortCommit() {
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();

  if (!commitSha) {
    return "local";
  }

  return commitSha.slice(0, 7);
}

export async function GET() {
  return Response.json({
    branch: process.env.VERCEL_GIT_COMMIT_REF?.trim() || null,
    commit: getShortCommit(),
    environment: process.env.VERCEL_ENV?.trim() || "local",
    nodeVersion: process.version,
  });
}
