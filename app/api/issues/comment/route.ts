import { getAdminDb } from "@/lib/firebase-admin";
import { requireUserToken } from "@/lib/request-auth";
import { IssueComment, IssueRecord } from "@/lib/types";

function createCommentId() {
  return `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: Request) {
  try {
    const decodedToken = await requireUserToken(request);
    const adminDb = getAdminDb();
    const body = (await request.json()) as { issueId?: string; text?: string };
    const text = body.text?.trim();

    if (!body.issueId || !text) {
      return Response.json(
        { error: "issueId and text are required." },
        { status: 400 },
      );
    }

    const issueRef = adminDb.collection("issues").doc(body.issueId);
    const snapshot = await issueRef.get();

    if (!snapshot.exists) {
      return Response.json({ error: "Issue not found." }, { status: 404 });
    }

    const issue = snapshot.data() as IssueRecord;
    const comments = issue.comments ?? [];
    const userSnapshot = await adminDb.collection("users").doc(decodedToken.uid).get();
    const userProfile = userSnapshot.exists ? userSnapshot.data() : null;
    const comment: IssueComment = {
      id: createCommentId(),
      text,
      user_id: decodedToken.uid,
      user_name:
        userProfile?.username?.trim() ||
        userProfile?.full_name?.trim() ||
        decodedToken.name ||
        decodedToken.email ||
        "Community member",
      created_at_iso: new Date().toISOString(),
    };

    await issueRef.update({
      comments: [...comments, comment],
    });

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Comment failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
