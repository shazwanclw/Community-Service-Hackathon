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

import {
  getDisplayInitials,
  getDisplayName,
  getIssueGalleryMode,
  getIssueBeforePhotoUrls,
} from "@/lib/profile-display";
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
  const [commentsOpen, setCommentsOpen] = useState(false);
  const nowMs = useLiveNow();
  const view = useMemo(() => getIssueView(issue, nowMs, viewerId), [issue, nowMs, viewerId]);
  const comments = issue.comments ?? [];
  const countdown = formatClaimTimeLeft(issue, nowMs);
  const imageUrls = getIssueBeforePhotoUrls(issue);
  const galleryMode = getIssueGalleryMode(imageUrls);
  const displayName = getDisplayName({
    fullName: issue.reporter_name,
    username: issue.reporter_username,
  });
  const initials = getDisplayInitials({
    fullName: issue.reporter_name,
    username: issue.reporter_username,
  });

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!commentText.trim() || !onComment) {
      return;
    }

    await onComment(issue, commentText.trim());
    setCommentText("");
  }

  return (
    <article className="border-b border-[#eee3d7] px-5 py-5 md:px-7">
      <div className="flex items-start gap-4">
        <div className="relative mt-1 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ead8d0] text-sm font-bold text-[#7a1a17]">
          {issue.reporter_profile_photo_url ? (
            <Image
              src={issue.reporter_profile_photo_url}
              alt={displayName}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            initials
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-[16px] font-bold text-black">
              {displayName}
            </p>
            <span className="text-sm text-[#8c7b77]">{formatRelativeDate(issue, nowMs)}</span>
            <span className="rounded-full bg-[#f9ece4] px-4 py-1.5 text-[14px] font-bold text-[#8e0d0d]">
              {issue.point_value} pts
            </span>
            <span className="rounded-full bg-[#8e0d0d] px-4 py-1.5 text-[14px] font-bold text-white">
              {view.statusLabel}
            </span>
          </div>

          <p className="mt-2 max-w-3xl text-[15px] leading-5 text-black">
            {issue.description}
          </p>

          {issue.location ? (
            <p className="mt-2 text-sm font-medium text-[#7c6761]">{issue.location}</p>
          ) : null}

          {imageUrls.length ? (
            <div className="mt-4 rounded-[18px]">
              {galleryMode === "single" ? (
                <div className="relative aspect-[16/10] max-w-[520px] overflow-hidden rounded-[18px] bg-[#eadfd6]">
                  <Image
                    src={imageUrls[0]}
                    alt={issue.description}
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) 100vw, 760px"
                  />
                </div>
              ) : null}

              {galleryMode === "double" ? (
                <div className="grid max-w-[760px] gap-4 md:grid-cols-2">
                  {imageUrls.slice(0, 2).map((imageUrl, index) => (
                    <div
                      key={`${imageUrl}-${index}`}
                      className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-[#eadfd6]"
                    >
                      <Image
                        src={imageUrl}
                        alt={`${issue.description} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 767px) 100vw, 45vw"
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              {galleryMode === "scroll" ? (
                <div className="overflow-x-auto">
                  <div className="flex gap-4">
                    {imageUrls.map((imageUrl, index) => (
                      <div
                        key={`${imageUrl}-${index}`}
                        className={`relative shrink-0 overflow-hidden rounded-[18px] bg-[#eadfd6] ${
                          index < 2
                            ? "aspect-[16/10] w-[280px] md:w-[340px]"
                            : "aspect-[16/10] w-[280px] md:w-[340px]"
                        }`}
                      >
                        <Image
                          src={imageUrl}
                          alt={`${issue.description} ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 767px) 100vw, 45vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#8c7b77]">
            <button
              type="button"
              onClick={() => void onLike?.(issue)}
              className={`inline-flex items-center gap-1.5 ${
                view.isLikedByViewer ? "text-[#8e0d0d]" : ""
              }`}
            >
              {busyAction === "like" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 ${view.isLikedByViewer ? "fill-current" : ""}`} />
              )}
              <span>{view.likeCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setCommentsOpen((current) => !current)}
              className={`inline-flex items-center gap-1.5 ${
                commentsOpen ? "text-[#8e0d0d]" : ""
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{view.commentCount}</span>
            </button>

            {view.phase === "claimed" && countdown ? (
              <span className="inline-flex items-center gap-1.5 text-[#8e0d0d]">
                <TimerReset className="h-4 w-4" />
                {countdown}
              </span>
            ) : null}
          </div>

          {comments.length ? (
            <div className="mt-4 space-y-2 rounded-[18px] bg-[#fbf6ef] px-4 py-3">
              {(commentsOpen ? comments : comments.slice(-3)).map((comment) => (
                <div key={comment.id}>
                  <p className="text-sm font-semibold text-[#671010]">
                    {comment.user_name}
                  </p>
                  <p className="text-sm leading-5 text-[#5d4844]">{comment.text}</p>
                </div>
              ))}
              {!commentsOpen && comments.length > 3 ? (
                <button
                  type="button"
                  onClick={() => setCommentsOpen(true)}
                  className="text-sm font-semibold text-[#8e0d0d]"
                >
                  See more comments
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            {view.canClaim ? (
              <button
                type="button"
                onClick={() => void onClaim?.(issue)}
                className="inline-flex items-center gap-2 rounded-full bg-[#8e0d0d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#741010]"
              >
                {busyAction === "claim" ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Wrench className="h-4 w-4" />
                )}
                Take task
              </button>
            ) : view.canSubmitProof ? (
              <Link
                href={`/issues/${issue.id}/fix`}
                className="inline-flex items-center gap-2 rounded-full bg-[#8e0d0d] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <ArrowRight className="h-4 w-4" />
                Continue task
              </Link>
            ) : null}

            {commentsOpen ? (
              <form
                onSubmit={(event) => void handleCommentSubmit(event)}
                className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row"
              >
                <label className="sr-only" htmlFor={`comment-${issue.id}`}>
                  Add comment
                </label>
                <input
                  id={`comment-${issue.id}`}
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Add a comment..."
                  className="min-w-0 flex-1 rounded-full border border-[#dbc8b8] bg-[#fffdf9] px-4 py-2.5 text-sm text-[#321817]"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#8e0d0d] px-4 py-2.5 text-sm font-semibold text-[#8e0d0d] disabled:opacity-50"
                >
                  {busyAction === "comment" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  Comment
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
