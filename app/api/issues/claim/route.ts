import { getAdminDb } from "@/lib/firebase-admin";
import { getIssueView, ISSUE_CLAIM_WINDOW_MS } from "@/lib/issue-lifecycle";
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

      if (issue.status !== "open") {
        throw new Error("Only open issues can be claimed.");
      }

      if (!view.canClaim) {
        throw new Error("This issue is currently claimed by someone else.");
      }

      transaction.update(issueRef, {
        fixer_id: decodedToken.uid,
        claimed_at_ms: nowMs,
        claim_expires_at_ms: nowMs + ISSUE_CLAIM_WINDOW_MS,
        extension_status: "none",
        extension_reason: null,
        extension_progress_note: null,
        extension_requested_at_ms: null,
      });
    });

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Claim failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
