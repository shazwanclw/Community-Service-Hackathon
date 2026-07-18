import { isAdminEmail } from "@/lib/admin-access";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

function getBearerToken(authorization: string | null) {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

export async function POST(request: Request) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const token = getBearerToken(request.headers.get("authorization"));

    if (!token) {
      return Response.json({ error: "Missing bearer token." }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const allowlist =
      process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS;

    if (!isAdminEmail(decodedToken.email, allowlist)) {
      return Response.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = (await request.json()) as { issueId?: string; pointValue?: number };
    const pointValue = Number(body.pointValue);

    if (!body.issueId || !Number.isFinite(pointValue) || pointValue <= 0) {
      return Response.json(
        { error: "issueId and a positive pointValue are required." },
        { status: 400 },
      );
    }

    await adminDb.collection("issues").doc(body.issueId).update({
      point_value: Math.round(pointValue),
      point_source: "admin",
      point_status: "approved",
      point_status_label: null,
    });

    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to assign points.";

    return Response.json({ error: message }, { status: 500 });
  }
}
