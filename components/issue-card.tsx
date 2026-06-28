"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  LoaderCircle,
  MessageCircle,
  TimerReset,
  Wrench,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { getIssueView } from "@/lib/issue-lifecycle";
import { IssueRecord } from "@/lib/types";
import { useLiveNow } from "@/lib/use-live-now";

function formatRelativeDate(issue: IssueRecord, nowMs: number) {
  const createdAtMs = issue.created_at?.toMillis?.();

  if (!createdAtMs) {
    return "Just reported";
  }

  const diffHours = Math.max(1, Math.floor((nowMs - createdAtMs) / 3600000));

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return `${Math.floor(diffHours / 24)}d ago`;
}

function formatClaimTimeLeft(issue: IssueRecord, nowMs: number) {
  if (!issue.claim_expires_at_ms) {
    return null;
  }

  const diffMs = issue.claim_expires_at_ms - nowMs;

  if (diffMs <= 0) {
    return "Claim window expired";
  }

  const totalHours = Math.ceil(diffMs / 3600000);

  if (totalHours >= 24) {
    return `${Math.ceil(totalHours / 24)} day left`;
  }

  return `${totalHours}h left`;
}

type IssueCardProps = {
  busyAction?: "claim" | "comment" | "like" | null;
  issue: IssueRecord;
  onClaim?: (issue: IssueRecord) => Promise<void> | void;
  onComment?: (issue: IssueRecord, text: string) => Promise<void> | void;
  onLike?: (issue: IssueRecord) => Promise<void> | void;
  viewerId?: string | null;
};

export function IssueCard({
  busyAction = null,
  issue,
  onClaim,
  onComment,
  onLike,
  viewerId,
}: IssueCardProps) {
  const [commentText, setCommentText] = useState("");
  const nowMs = useLiveNow();
  const view = useMemo(() => getIssueView(issue, nowMs, viewerId), [issue, nowMs, viewerId]);
  const comments = issue.comments ?? [];
  const countdown = formatClaimTimeLeft(issue, nowMs);

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!commentText.trim() || !onComment) {
      return;
    }

    await onComment(issue, commentText.trim());
    setCommentText("");
  }

  return (
    <article className="overflow-hidden rounded-[32px] border border-[#d8d0c3] bg-white shadow-[0_18px_40px_rgba(18,53,36,0.08)]">
      <div className="border-b border-[#efe4d2] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#123524]">
              {issue.reporter_name ?? "Community member"}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#6d7f71]">
              {formatRelativeDate(issue, nowMs)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#f4a261]/18 px-3 py-1 text-sm font-bold text-[#8f4b11]">
              {issue.point_value} pts
            </span>
            <span className="rounded-full bg-[#123524] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#f7f1e7]">
              {view.statusLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="relative aspect-[16/10] bg-[#e9e0d2]">
        <Image
          src={issue.before_photo_url}
          alt={issue.description}
          fill
          className="object-cover"
          sizes="(max-width: 767px) 100vw, 760px"
        />
      </div>

      <div className="space-y-4 px-5 py-5">
        <p className="text-base leading-7 text-[#2c4633]">{issue.description}</p>

        <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#6d7f71]">
          <span className="rounded-full bg-[#f8f2e8] px-3 py-2">
            {view.likeCount} likes
          </span>
          <span className="rounded-full bg-[#f8f2e8] px-3 py-2">
            {view.commentCount} comments
          </span>
          {view.phase === "claimed" && countdown ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#fff4e6] px-3 py-2 text-[#8f4b11]">
              <TimerReset className="h-3.5 w-3.5" />
              {countdown}
            </span>
          ) : null}
        </div>

        {comments.length ? (
          <div className="space-y-3 rounded-[24px] bg-[#f8f2e8] p-4">
            {comments.slice(-3).map((comment) => (
              <div key={comment.id}>
                <p className="text-sm font-semibold text-[#123524]">
                  {comment.user_name}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#47624b]">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void onLike?.(issue)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
              view.isLikedByViewer
                ? "bg-[#123524] text-[#f7f1e7]"
                : "border border-[#d8d0c3] bg-white text-[#123524]"
            }`}
          >
            {busyAction === "like" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
            {view.isLikedByViewer ? "Liked" : "Like"}
          </button>

          {view.canClaim ? (
            <button
              type="button"
              onClick={() => void onClaim?.(issue)}
              className="inline-flex items-center gap-2 rounded-full bg-[#f4a261] px-4 py-3 text-sm font-semibold text-[#123524] transition hover:bg-[#ee9753]"
            >
              {busyAction === "claim" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Wrench className="h-4 w-4" />
              )}
              Take Task
            </button>
          ) : view.canSubmitProof ? (
            <Link
              href={`/issues/${issue.id}/fix`}
              className="inline-flex items-center gap-2 rounded-full bg-[#123524] px-4 py-3 text-sm font-semibold text-[#f7f1e7]"
            >
              <ArrowRight className="h-4 w-4" />
              Continue Task
            </Link>
          ) : null}
        </div>

        <form onSubmit={(event) => void handleCommentSubmit(event)} className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor={`comment-${issue.id}`}>
            Add comment
          </label>
          <input
            id={`comment-${issue.id}`}
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Add a comment or ask about the issue..."
            className="min-w-0 flex-1 rounded-full border border-[#d8d0c3] bg-[#fffaf3] px-4 py-3 text-sm text-[#123524]"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#123524] px-4 py-3 text-sm font-semibold text-[#123524] disabled:opacity-50"
          >
            {busyAction === "comment" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
            Comment
          </button>
        </form>
      </div>
    </article>
  );
}
