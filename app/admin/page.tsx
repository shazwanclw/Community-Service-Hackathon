"use client";

import Image from "next/image";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { auth, db } from "@/lib/firebase";
import { IssueRecord } from "@/lib/types";

function sortIssues(issues: IssueRecord[]) {
  return [...issues].sort((a, b) => {
    const aMillis = a.created_at?.toMillis?.() ?? 0;
    const bMillis = b.created_at?.toMillis?.() ?? 0;
    return bMillis - aMillis;
  });
}

export default function AdminPage() {
  const { isAdmin, loading, user } = useAuth();
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [pointReviewIssues, setPointReviewIssues] = useState<IssueRecord[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [pointDrafts, setPointDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"repairs" | "points">("repairs");

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const q = query(collection(db, "issues"), where("status", "==", "pending"));

    return onSnapshot(
      q,
      (snapshot) => {
        const pendingIssues = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...(docSnapshot.data() as Omit<IssueRecord, "id">),
        }));

        setIssues(sortIssues(pendingIssues));
        setLoadError(null);
      },
      () => {
        setIssues([]);
        setLoadError("Unable to load the moderation queue right now.");
      },
    );
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const q = query(
      collection(db, "issues"),
      where("point_status", "==", "pending_admin_review"),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const pendingPointIssues = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...(docSnapshot.data() as Omit<IssueRecord, "id">),
        }));

        setPointReviewIssues(sortIssues(pendingPointIssues));
      },
      () => {
        setPointReviewIssues([]);
      },
    );
  }, [isAdmin]);

  async function approveIssue(issueId: string) {
    setApprovingId(issueId);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        throw new Error("Missing Firebase session token.");
      }

      const response = await fetch("/api/admin/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ issueId }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Failed to approve issue.");
      }
    } catch (approvalError) {
      const message =
        approvalError instanceof Error
          ? approvalError.message
          : "Approval failed.";
      setError(message);
    } finally {
      setApprovingId(null);
    }
  }

  async function assignPoints(issueId: string) {
    setAssigningId(issueId);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        throw new Error("Missing Firebase session token.");
      }

      const pointValue = Number(pointDrafts[issueId] ?? 0);

      const response = await fetch("/api/admin/assign-points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ issueId, pointValue }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Failed to assign points.");
      }
    } catch (assignmentError) {
      setError(
        assignmentError instanceof Error
          ? assignmentError.message
          : "Point assignment failed.",
      );
    } finally {
      setAssigningId(null);
    }
  }

  if (!loading && user && !isAdmin) {
    return (
      <AppShell
        title="Admin"
        subtitle="This area is limited to moderation accounts configured in the app environment."
      >
        <div className="rounded-[30px] border border-dashed border-[#cbbfaa] bg-white/70 px-5 py-10 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-[#47624b]" />
          <p className="mt-4 font-display text-3xl text-[#123524]">No access</p>
          <p className="mt-3 text-sm leading-6 text-[#47624b]">
            Your account is authenticated but not included in the moderation
            allowlist.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Moderation"
      subtitle="Compare before and after evidence, then release points only when the repair is complete."
    >
      <div className="px-4 pt-5 sm:px-5 md:px-8">
        <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3">
          {[
            { key: "repairs" as const, label: "Repair submissions" },
            { key: "points" as const, label: "Point review" },
          ].map((tab) => {
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex shrink-0 items-center rounded-full px-4 py-2.5 text-sm font-semibold transition ${
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
      </div>

      {error ? (
        <div className="mx-5 mb-4 mt-4 rounded-3xl border border-[#f0b7b7] bg-[#fff1f1] px-4 py-3 text-sm text-[#a63f3f] md:mx-8">
          {error}
        </div>
      ) : null}
      {loadError ? (
        <div className="mx-5 mb-4 mt-4 rounded-3xl border border-[#f0b7b7] bg-[#fff1f1] px-4 py-3 text-sm text-[#a63f3f] md:mx-8">
          {loadError}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#8e0d0d]" />
        </div>
      ) : activeTab === "repairs" && !loadError && issues.length ? (
        <div className="space-y-4 px-4 py-5 sm:px-5 md:px-8">
          {issues.map((issue) => (
            <article
              key={issue.id}
              className="rounded-[22px] border border-[#dfcec0] bg-white p-4 shadow-[0_12px_30px_rgba(77,28,25,0.06)] sm:p-5"
            >
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_320px]">
                <div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8d6d63]">
                        Before
                      </p>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-[#e9e0d2]">
                        <Image
                          src={issue.before_photo_url}
                          alt="Before"
                          fill
                          className="object-cover"
                          sizes="(max-width: 767px) 100vw, 40vw"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8d6d63]">
                        After
                      </p>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-[#e9e0d2]">
                        {issue.after_photo_url ? (
                          <Image
                            src={issue.after_photo_url}
                            alt="After"
                            fill
                            className="object-cover"
                            sizes="(max-width: 767px) 100vw, 40vw"
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[#5d4844]">
                    {issue.description}
                  </p>
                </div>

                <div className="flex flex-col justify-between rounded-[18px] bg-[#fbf6ef] p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8d6d63]">
                      Moderation action
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#6d5752]">
                      Release points only if the repair is complete and the
                      after-photo evidence clearly resolves the issue.
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#fff1ea] px-3 py-1 text-sm font-bold text-[#8e0d0d]">
                      {issue.point_value} pts
                    </span>
                    <button
                      type="button"
                      onClick={() => void approveIssue(issue.id)}
                      disabled={approvingId === issue.id}
                      className="inline-flex items-center gap-2 rounded-full bg-[#8e0d0d] px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
                    >
                      {approvingId === issue.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : null}
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : activeTab === "points" && pointReviewIssues.length ? (
        <div className="space-y-4 px-4 py-5 sm:px-5 md:px-8">
          {pointReviewIssues.map((issue) => (
            <article
              key={issue.id}
              className="rounded-[22px] border border-[#dfcec0] bg-white p-4 shadow-[0_12px_30px_rgba(77,28,25,0.06)] sm:p-5"
            >
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_340px]">
                <div>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-[#e9e0d2]">
                    <Image
                      src={issue.before_photo_url}
                      alt="Issue awaiting points"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1279px) 100vw, 40vw"
                    />
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[#5d4844]">{issue.description}</p>
                  {issue.location ? (
                    <p className="mt-3 text-sm font-semibold text-[#7b1917]">
                      {issue.location}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-[18px] bg-[#fbf6ef] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8d6d63]">
                    Point review
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#6d5752]">
                    AI could not assign a reliable task score. Set the reward points here before the issue becomes claimable.
                  </p>
                  <div className="mt-5 space-y-3">
                    <input
                      type="number"
                      min={1}
                      value={pointDrafts[issue.id] ?? ""}
                      onChange={(event) =>
                        setPointDrafts((current) => ({
                          ...current,
                          [issue.id]: event.target.value,
                        }))
                      }
                      placeholder="Assign points"
                      className="w-full rounded-[14px] border border-[#d8c4b2] bg-white px-4 py-3 text-sm text-[#321817]"
                    />
                    <button
                      type="button"
                      onClick={() => void assignPoints(issue.id)}
                      disabled={assigningId === issue.id}
                      className="inline-flex items-center gap-2 rounded-full bg-[#8e0d0d] px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
                    >
                      {assigningId === issue.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : null}
                      Save points
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mx-5 mt-5 rounded-[24px] border border-dashed border-[#d1b7a4] bg-white/70 px-5 py-10 text-center md:mx-8">
          <p className="font-display text-3xl text-[#8e0d0d]">Queue is clear</p>
          <p className="mt-3 text-sm leading-6 text-[#6d5752]">
            {activeTab === "repairs"
              ? "No pending repair submissions are waiting for moderation."
              : "No reports are waiting for manual point review."}
          </p>
        </div>
      )}
    </AppShell>
  );
}
