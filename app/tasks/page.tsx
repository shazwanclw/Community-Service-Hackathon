"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Eye, LoaderCircle, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { IssuePreviewModal } from "@/components/issue-preview-modal";
import { db } from "@/lib/firebase";
import { getIssueView } from "@/lib/issue-lifecycle";
import { IssueRecord } from "@/lib/types";
import { useLiveNow } from "@/lib/use-live-now";

type TaskTab = "active" | "review" | "completed";

function sortIssues(issues: IssueRecord[]) {
  return [...issues].sort((a, b) => {
    const aMillis = a.created_at?.toMillis?.() ?? 0;
    const bMillis = b.created_at?.toMillis?.() ?? 0;
    return bMillis - aMillis;
  });
}

function formatClaimTimeLeft(issue: IssueRecord, nowMs: number) {
  if (!issue.claim_expires_at_ms) {
    return "No deadline";
  }

  const diffMs = issue.claim_expires_at_ms - nowMs;

  if (diffMs <= 0) {
    return "Expired";
  }

  const totalMinutes = Math.ceil(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) {
    return `${minutes}m left`;
  }

  if (!minutes) {
    return `${hours}h left`;
  }

  return `${hours}h ${minutes}m left`;
}

export default function TasksPage() {
  const router = useRouter();
  const { loading, user } = useAuth();
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TaskTab>("active");
  const [previewIssue, setPreviewIssue] = useState<IssueRecord | null>(null);
  const nowMs = useLiveNow();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const q = query(collection(db, "issues"), where("fixer_id", "==", user.uid));

    return onSnapshot(
      q,
      (snapshot) => {
        const nextIssues = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...(docSnapshot.data() as Omit<IssueRecord, "id">),
        }));
        setIssues(sortIssues(nextIssues));
        setError(null);
      },
      () => {
        setIssues([]);
        setError("Unable to load your task list right now.");
      },
    );
  }, [user]);

  const activeTasks = useMemo(
    () =>
      issues.filter((issue) => getIssueView(issue, nowMs, user?.uid).phase === "claimed"),
    [issues, nowMs, user?.uid],
  );
  const pendingTasks = useMemo(
    () =>
      issues.filter(
        (issue) => getIssueView(issue, nowMs, user?.uid).phase === "pending_review",
      ),
    [issues, nowMs, user?.uid],
  );
  const resolvedTasks = useMemo(
    () =>
      issues.filter((issue) => getIssueView(issue, nowMs, user?.uid).phase === "resolved"),
    [issues, nowMs, user?.uid],
  );

  const tabConfig = [
    { key: "active" as const, label: "Active claims", items: activeTasks },
    { key: "review" as const, label: "Waiting review", items: pendingTasks },
    { key: "completed" as const, label: "Completed", items: resolvedTasks },
  ];

  const currentItems =
    activeTab === "active"
      ? activeTasks
      : activeTab === "review"
        ? pendingTasks
        : resolvedTasks;

  return (
    <AppShell
      title="Tasks Board"
      subtitle="Track active work, keep an eye on deadlines, and keep a simple record of what you already finished."
    >
      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#8e0d0d]" />
        </div>
      ) : error ? (
        <div className="mx-5 mt-5 rounded-[18px] border border-[#f0b7b7] bg-[#fff1f1] px-4 py-3 text-sm text-[#a63f3f] md:mx-8">
          {error}
        </div>
      ) : (
        <div className="space-y-5 px-5 py-5 md:px-8">
          <div className="flex flex-wrap gap-3">
            {tabConfig.map((tab) => {
              const active = tab.key === activeTab;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-[#8e0d0d] text-white"
                      : "border border-[#d8c4b2] bg-[#fffdf8] text-[#7b1917]"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      active ? "bg-white/15 text-white" : "bg-[#f8f2e8] text-[#8d6d63]"
                    }`}
                  >
                    {tab.items.length}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-[22px] border border-[#e2d1c3] bg-white">
            <div className="hidden grid-cols-[minmax(0,1.5fr)_110px_170px_160px_150px] gap-4 border-b border-[#efe4d2] px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#8d6d63] md:grid">
              <div>Task</div>
              <div>Points</div>
              <div>{activeTab === "active" ? "Deadline" : "Status"}</div>
              <div>Images</div>
              <div>Action</div>
            </div>

            {currentItems.length ? (
              <div className="divide-y divide-[#efe4d2]">
                {currentItems.map((issue) => {
                  const view = getIssueView(issue, nowMs, user?.uid);
                  const canContinue = activeTab === "active" && view.canSubmitProof;

                  return (
                    <div
                      key={issue.id}
                      className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-[minmax(0,1.5fr)_110px_170px_160px_150px]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative hidden h-20 w-24 shrink-0 overflow-hidden rounded-[18px] bg-[#e9e0d2] sm:block">
                          <Image
                            src={issue.before_photo_url}
                            alt={issue.description}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold text-[#321817]">
                            {issue.description}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8d6d63]">
                            {activeTab === "active"
                              ? "Work in progress"
                              : activeTab === "review"
                                ? "Submitted for moderation"
                                : "Approved task"}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm font-bold text-[#8e0d0d]">
                        {issue.point_value} pts
                      </div>

                      <div className="text-sm font-semibold text-[#321817]">
                        {activeTab === "active" ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-[#fff1ea] px-3 py-2 text-[#8e0d0d]">
                            <TimerReset className="h-4 w-4" />
                            {formatClaimTimeLeft(issue, nowMs)}
                          </span>
                        ) : (
                          view.statusLabel
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative h-14 w-16 overflow-hidden rounded-[16px] bg-[#e9e0d2]">
                          <Image
                            src={issue.before_photo_url}
                            alt="Before"
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        {activeTab !== "active" && issue.after_photo_url ? (
                          <div className="relative h-14 w-16 overflow-hidden rounded-[16px] bg-[#e9e0d2]">
                            <Image
                              src={issue.after_photo_url}
                              alt="After"
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewIssue(issue)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#d8c4b2] bg-[#fffaf3] px-4 py-2 text-sm font-semibold text-[#8e0d0d]"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        {canContinue ? (
                          <Link
                            href={`/issues/${issue.id}/fix`}
                            className="inline-flex items-center rounded-full bg-[#8e0d0d] px-4 py-2 text-sm font-semibold text-white"
                          >
                            Continue
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-10 text-center">
                <p className="font-display text-3xl text-[#8e0d0d]">
                  {activeTab === "active"
                    ? "No active claims"
                    : activeTab === "review"
                      ? "Nothing waiting for review"
                      : "No completed tasks yet"}
                </p>
                <p className="mt-3 text-sm leading-6 text-[#6d5752]">
                  {activeTab === "active"
                    ? "Pick a task from the issue board and it will appear here."
                    : activeTab === "review"
                      ? "Submitted tasks will stay here until moderation finishes."
                      : "Approved work will stay here as your visual record."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {previewIssue ? (
        <IssuePreviewModal
          afterPhotoUrl={
            activeTab === "active" ? null : previewIssue.after_photo_url ?? null
          }
          beforePhotoUrl={previewIssue.before_photo_url}
          description={previewIssue.description}
          onClose={() => setPreviewIssue(null)}
          pointValue={previewIssue.point_value}
          reporterName={previewIssue.reporter_name}
          statusLabel={getIssueView(previewIssue, nowMs, user?.uid).statusLabel}
          title="Task preview"
        />
      ) : null}
    </AppShell>
  );
}
