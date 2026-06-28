import { getAdminDb } from "@/lib/firebase-admin";
import { getIssueView } from "@/lib/issue-lifecycle";
import { requireUserToken } from "@/lib/request-auth";
import { IssueRecord } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const decodedToken = await requireUserToken(request);
    const adminDb = getAdminDb();
    const body = (await request.json()) as {
      issueId?: string;
      afterPhotoUrl?: string;
    };

    if (!body.issueId || !body.afterPhotoUrl) {
      return Response.json(
        { error: "issueId and afterPhotoUrl are required." },
        { status: 400 },
      );
    }

    const nowMs = Date.now();
    const issueRef = adminDb.collection("issues").doc(body.issueId);

    await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(issueRef);

      if (!snapshot.exists) {
        throw new Error("Issue not found.");
      }

      const issue = {
        id: snapshot.id,
        ...(snapshot.data() as Omit<IssueRecord, "id">),
      };
      const view = getIssueView(issue, nowMs, decodedToken.uid);

      if (!view.canSubmitProof) {
        throw new Error("You can only submit proof for your active task.");
      }

      transaction.update(issueRef, {
        after_photo_url: body.afterPhotoUrl,
        status: "pending",
      });
    });

    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Completion submission failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
