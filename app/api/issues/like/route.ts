import { FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase-admin";
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

    const issueRef = adminDb.collection("issues").doc(body.issueId);
    const snapshot = await issueRef.get();

    if (!snapshot.exists) {
      return Response.json({ error: "Issue not found." }, { status: 404 });
    }

    const issue = snapshot.data() as IssueRecord;
    const likedBy = issue.liked_by ?? [];
    const alreadyLiked = likedBy.includes(decodedToken.uid);

    await issueRef.update({
      liked_by: alreadyLiked
        ? FieldValue.arrayRemove(decodedToken.uid)
        : FieldValue.arrayUnion(decodedToken.uid),
    });

    return Response.json({ liked: !alreadyLiked, ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Like failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
