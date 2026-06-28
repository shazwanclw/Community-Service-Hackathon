import { FieldValue } from "firebase-admin/firestore";

import { isAdminEmail } from "@/lib/admin-access";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

type PendingIssue = {
  fixer_id?: string | null;
  point_value?: number;
  status?: string;
};

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

    const body = (await request.json()) as { issueId?: string };

    if (!body.issueId) {
      return Response.json({ error: "issueId is required." }, { status: 400 });
    }

    const issueId = body.issueId;

    await adminDb.runTransaction(async (transaction) => {
      const issueRef = adminDb.collection("issues").doc(issueId);
      const issueSnapshot = await transaction.get(issueRef);

      if (!issueSnapshot.exists) {
        throw new Error("Issue not found.");
      }

      const issue = issueSnapshot.data() as PendingIssue;

      if (issue.status !== "pending") {
        throw new Error("Only pending issues can be approved.");
      }

      if (!issue.fixer_id) {
        throw new Error("Pending issue is missing fixer_id.");
      }

      const awardedPoints = Number(issue.point_value ?? 0);

      if (!Number.isFinite(awardedPoints) || awardedPoints <= 0) {
        throw new Error("Pending issue has an invalid point value.");
      }

      const userRef = adminDb.collection("users").doc(issue.fixer_id);

      transaction.update(issueRef, {
        status: "approved",
      });

      transaction.set(
        userRef,
        {
          total_points: FieldValue.increment(awardedPoints),
        },
        { merge: true },
      );
    });

    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to approve issue.";

    return Response.json({ error: message }, { status: 500 });
  }
}
