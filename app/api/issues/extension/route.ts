import { getAdminDb } from "@/lib/firebase-admin";
import {
  getIssueView,
  ISSUE_EXTENSION_WINDOW_MS,
} from "@/lib/issue-lifecycle";
import { requireUserToken } from "@/lib/request-auth";
import { IssueRecord } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const decodedToken = await requireUserToken(request);
    const adminDb = getAdminDb();
    const body = (await request.json()) as {
      issueId?: string;
      progressNote?: string;
      reason?: string;
    };

    const progressNote = body.progressNote?.trim();
    const reason = body.reason?.trim();

    if (!body.issueId || !progressNote || progressNote.length < 20) {
      return Response.json(
        { error: "issueId and a progress note of at least 20 characters are required." },
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

      if (!view.isOwnedByViewer || !view.canSubmitProof) {
        throw new Error("You can only extend your own active task.");
      }

      if (issue.extension_status === "approved") {
        throw new Error("An extension has already been used for this task.");
      }

      transaction.update(issueRef, {
        claim_expires_at_ms:
          Math.max(issue.claim_expires_at_ms ?? nowMs, nowMs) +
          ISSUE_EXTENSION_WINDOW_MS,
        extension_status: "approved",
        extension_reason: reason ?? "Progress update submitted",
        extension_progress_note: progressNote,
        extension_requested_at_ms: nowMs,
      });
    });

    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Extension request failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
