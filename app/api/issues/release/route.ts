import { getAdminDb } from "@/lib/firebase-admin";
import { getIssueView } from "@/lib/issue-lifecycle";
import { requireUserToken } from "@/lib/request-auth";
import { IssueRecord } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const decodedToken = await requireUserToken(request);
    const adminDb = getAdminDb();
    const body = (await request.json()) as { issueId?: string };

    if (!body.issueId) {
      return Response.json({ error: "issueId is required." }, { status: 400 });
    }

    const nowMs = Date.now();
    const issueRef = adminDb.collection("issues").doc(body.issueId);

    await adminDb.runTransaction(async (transaction) => {
      const issueSnapshot = await transaction.get(issueRef);

      if (!issueSnapshot.exists) {
        throw new Error("Issue not found.");
      }

      const issue = {
        id: issueSnapshot.id,
        ...(issueSnapshot.data() as Omit<IssueRecord, "id">),
      };
      const view = getIssueView(issue, nowMs, decodedToken.uid);

      if (!view.isOwnedByViewer || !view.canSubmitProof) {
        throw new Error("You can only remove your own active task.");
      }

      transaction.update(issueRef, {
        fixer_id: null,
        claimed_at_ms: null,
        claim_expires_at_ms: null,
        extension_status: "none",
        extension_reason: null,
        extension_progress_note: null,
        extension_requested_at_ms: null,
      });
    });

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Task release failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
