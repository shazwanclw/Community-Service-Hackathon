import { IssueRecord } from "@/lib/types";

export const ISSUE_CLAIM_WINDOW_MS = 24 * 60 * 60 * 1000;
export const ISSUE_EXTENSION_WINDOW_MS = 12 * 60 * 60 * 1000;

export type IssuePhase =
  | "available"
  | "claimed"
  | "pending_review"
  | "resolved";

export type IssueView = {
  canClaim: boolean;
  canSubmitProof: boolean;
  commentCount: number;
  isOwnedByViewer: boolean;
  isLikedByViewer: boolean;
  likeCount: number;
  phase: IssuePhase;
  statusLabel: string;
};

export function isIssueClaimActive(issue: IssueRecord, nowMs = Date.now()) {
  if (issue.status !== "open") {
    return false;
  }

  if (!issue.fixer_id || !issue.claim_expires_at_ms) {
    return false;
  }

  return issue.claim_expires_at_ms > nowMs;
}

export function getIssueView(
  issue: IssueRecord,
  nowMs = Date.now(),
  viewerId?: string | null,
): IssueView {
  const activeClaim = isIssueClaimActive(issue, nowMs);
  const isOwnedByViewer = Boolean(viewerId && issue.fixer_id === viewerId && activeClaim);
  const likedBy = issue.liked_by ?? [];
  const comments = issue.comments ?? [];

  if (issue.status === "approved") {
    return {
      canClaim: false,
      canSubmitProof: false,
      commentCount: comments.length,
      isLikedByViewer: Boolean(viewerId && likedBy.includes(viewerId)),
      isOwnedByViewer: false,
      likeCount: likedBy.length,
      phase: "resolved",
      statusLabel: "Resolved",
    };
  }

  if (issue.status === "pending") {
    return {
      canClaim: false,
      canSubmitProof: false,
      commentCount: comments.length,
      isLikedByViewer: Boolean(viewerId && likedBy.includes(viewerId)),
      isOwnedByViewer: Boolean(viewerId && issue.fixer_id === viewerId),
      likeCount: likedBy.length,
      phase: "pending_review",
      statusLabel: "Pending Review",
    };
  }

  if (activeClaim) {
    return {
      canClaim: false,
      canSubmitProof: isOwnedByViewer,
      commentCount: comments.length,
      isLikedByViewer: Boolean(viewerId && likedBy.includes(viewerId)),
      isOwnedByViewer,
      likeCount: likedBy.length,
      phase: "claimed",
      statusLabel: "Claimed",
    };
  }

  const hasExpiredClaim = Boolean(issue.fixer_id && issue.claim_expires_at_ms);

  return {
    canClaim: true,
    canSubmitProof: false,
    commentCount: comments.length,
    isLikedByViewer: Boolean(viewerId && likedBy.includes(viewerId)),
    isOwnedByViewer: false,
    likeCount: likedBy.length,
    phase: "available",
    statusLabel: hasExpiredClaim ? "Open Again" : "Open Task",
  };
}
