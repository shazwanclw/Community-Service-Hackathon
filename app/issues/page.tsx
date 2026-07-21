"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { Eye, Funnel, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { IssuePreviewModal } from "@/components/issue-preview-modal";
import { postAuthedJson } from "@/lib/client-api";
import { db } from "@/lib/firebase";
import { getIssueView } from "@/lib/issue-lifecycle";
import { getDisplayName, getIssueBeforePhotoUrls } from "@/lib/profile-display";
import { IssueRecord } from "@/lib/types";
import { useLiveNow } from "@/lib/use-live-now";

type SortMode = "newest" | "points";
type StatusFilter = "all" | "active" | "waiting" | "resolved";

function sortIssues(
  issues: IssueRecord[],
  sortMode: SortMode,
) {
  const next = [...issues];

  next.sort((a, b) => {
    if (sortMode === "points") {
      return b.point_value - a.point_value;
    }

    const aMillis = a.created_at?.toMillis?.() ?? 0;
    const bMillis = b.created_at?.toMillis?.() ?? 0;
    return bMillis - aMillis;
  });

  return next;
}

export default function IssuesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [busyIssueId, setBusyIssueId] = useState<string | null>(null);
  const [previewIssue, setPreviewIssue] = useState<IssueRecord | null>(null);
  const nowMs = useLiveNow();

  useEffect(() => {
    return onSnapshot(
      collection(db, "issues"),
      (snapshot) => {
        const nextIssues = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...(docSnapshot.data() as Omit<IssueRecord, "id">),
        }));

        setIssues(nextIssues);
        setError(null);
        setLoading(false);
      },
      () => {
        setIssues([]);
        setError("Unable to load the issue overview right now.");
        setLoading(false);
      },
    );
  }, []);

  const sortedIssues = useMemo(() => {
    const filtered = issues.filter((issue) => {
      const view = getIssueView(issue, nowMs, user?.uid);
      if (statusFilter === "active") {
        return view.phase === "available" || view.phase === "claimed";
      }
      if (statusFilter === "waiting") {
        return view.phase === "pending_review";
      }
      if (statusFilter === "resolved") {
        return view.phase === "resolved";
      }
      return true;
    });

    return sortIssues(filtered, sortMode);
  }, [issues, nowMs, sortMode, statusFilter, user?.uid]);

  async function handleClaim(issueId: string) {
    if (!user) {
      router.push("/auth");
      return;
    }

    setBusyIssueId(issueId);
    setError(null);

    try {
      await postAuthedJson("/api/issues/claim", { issueId }, { timeoutMs: 10000 });
      router.push("/tasks");
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Claim failed.");
    } finally {
      setBusyIssueId(null);
    }
  }

  return (
    <AppShell
      title="Issues Board"
      subtitle="Browse reported issues."
      actions={
        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white px-3 py-2.5 text-xs font-semibold text-[#8e0d0d] shadow-[0_12px_28px_rgba(77,28,25,0.14)] sm:px-4 sm:py-3 sm:text-sm"
          >
            <Funnel className="h-4 w-4" />
            Filter
          </button>

          {filterOpen ? (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[220px] rounded-[16px] border border-[#dfcec0] bg-white p-2 shadow-[0_18px_48px_rgba(77,28,25,0.12)]">
              {[
                { value: "newest", label: "Newest first" },
                { value: "points", label: "Highest points" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSortMode(option.value as SortMode);
                    setFilterOpen(false);
                  }}
                  className={`block w-full rounded-[12px] px-3 py-2 text-left text-sm ${
                    sortMode === option.value
                      ? "bg-[#f9ece4] font-semibold text-[#8e0d0d]"
                      : "text-[#5d4844] hover:bg-[#fbf6ef]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      }
    >
      {error ? (
        <div className="mx-5 mt-5 rounded-[18px] border border-[#f0b7b7] bg-[#fff1f1] px-4 py-3 text-sm text-[#a63f3f] md:mx-8">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#8e0d0d]" />
        </div>
      ) : (
        <div className="px-4 py-5 sm:px-5 md:px-8">
          <div className="mb-5 flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3">
            {[
              { value: "all" as const, label: "All" },
              { value: "active" as const, label: "Active claim" },
              { value: "waiting" as const, label: "Waiting review" },
              { value: "resolved" as const, label: "Completed" },
            ].map((tab) => {
              const active = tab.value === statusFilter;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`inline-flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[#8e0d0d] text-white"
                      : "border border-[#d8c4b2] bg-[#fffdf8] text-[#7b1917]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-3 md:space-y-0 md:overflow-hidden md:rounded-[22px] md:border md:border-[#dfcec0] md:bg-white">
            <div className="hidden grid-cols-[140px_minmax(0,1.8fr)_120px_120px_180px] gap-4 border-b border-[#efe4d2] bg-[#fbf6ef] px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#8d6d63] md:grid">
              <div>Reporter</div>
              <div>Issue</div>
              <div>Photos</div>
              <div>Points</div>
              <div>Action</div>
            </div>

            <div className="divide-y divide-[#efe4d2]">
              {sortedIssues.map((issue) => {
                const view = getIssueView(issue, nowMs, user?.uid);
                const imageUrls = getIssueBeforePhotoUrls(issue);
                const displayName = getDisplayName({
                  fullName: issue.reporter_name,
                  username: issue.reporter_username,
                });

                return (
                  <div
                    key={issue.id}
                    className="grid grid-cols-1 gap-4 rounded-[22px] border border-[#dfcec0] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(77,28,25,0.06)] md:grid-cols-[140px_minmax(0,1.8fr)_120px_120px_180px] md:rounded-none md:border-0 md:bg-transparent md:px-5 md:py-5 md:shadow-none"
                  >
                    <div className="text-sm font-semibold text-[#321817]">{displayName}</div>

                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm text-[#321817]">{issue.description}</p>
                      {issue.location ? (
                        <p className="mt-2 text-sm text-[#7c6761]">{issue.location}</p>
                      ) : null}
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#8d6d63]">
                        {view.statusLabel}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                      {imageUrls.slice(0, 3).map((imageUrl, index) => (
                        <div
                          key={`${issue.id}-image-${index}`}
                          className="relative h-14 w-14 overflow-hidden rounded-[12px] bg-[#eadfd6]"
                        >
                          <Image
                            src={imageUrl}
                            alt={`${issue.description} ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="text-sm font-bold text-[#8e0d0d]">
                      {view.phase === "awaiting_points"
                        ? "Pending admin"
                        : `${issue.point_value} pts`}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewIssue(issue)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#d8c4b2] bg-[#fffaf6] px-4 py-2 text-sm font-semibold text-[#8e0d0d]"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      {view.canClaim ? (
                        <button
                          type="button"
                          onClick={() => void handleClaim(issue.id)}
                          disabled={busyIssueId === issue.id}
                          className="inline-flex items-center gap-2 rounded-full bg-[#8e0d0d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {busyIssueId === issue.id ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : null}
                          Take task
                        </button>
                      ) : view.canSubmitProof ? (
                        <button
                          type="button"
                          onClick={() => router.push(`/issues/${issue.id}/fix`)}
                          className="rounded-full border border-[#8e0d0d] px-4 py-2 text-sm font-semibold text-[#8e0d0d]"
                        >
                          Continue
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {!sortedIssues.length ? (
                <div className="px-5 py-10 text-center">
                  <p className="font-display text-3xl text-[#8e0d0d]">No issues yet</p>
                  <p className="mt-3 text-sm leading-6 text-[#6d5752]">
                    New community reports will appear here.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {previewIssue ? (
        <IssuePreviewModal
          beforePhotoUrl={getIssueBeforePhotoUrls(previewIssue)[0]}
          description={previewIssue.description}
          onClose={() => setPreviewIssue(null)}
          pointValue={previewIssue.point_value}
          reporterName={
            getDisplayName({
              fullName: previewIssue.reporter_name,
              username: previewIssue.reporter_username,
            })
          }
          statusLabel={getIssueView(previewIssue, nowMs, user?.uid).statusLabel}
          title="Issue details"
        />
      ) : null}
    </AppShell>
  );
}
