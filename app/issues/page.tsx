"use client";

import { useRouter } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { postAuthedJson } from "@/lib/client-api";
import { getIssueView } from "@/lib/issue-lifecycle";
import { IssueRecord } from "@/lib/types";
import { useLiveNow } from "@/lib/use-live-now";

type SortMode = "newest" | "points" | "available" | "claimed";

function sortIssues(
  issues: IssueRecord[],
  sortMode: SortMode,
  nowMs: number,
  viewerId?: string,
) {
  const next = [...issues];

  next.sort((a, b) => {
    if (sortMode === "points") {
      return b.point_value - a.point_value;
    }

    if (sortMode === "available") {
      const aAvailable = getIssueView(a, nowMs, viewerId).phase === "available" ? 1 : 0;
      const bAvailable = getIssueView(b, nowMs, viewerId).phase === "available" ? 1 : 0;
      return bAvailable - aAvailable;
    }

    if (sortMode === "claimed") {
      const aClaimed = getIssueView(a, nowMs, viewerId).phase === "claimed" ? 1 : 0;
      const bClaimed = getIssueView(b, nowMs, viewerId).phase === "claimed" ? 1 : 0;
      return bClaimed - aClaimed;
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
  const [busyIssueId, setBusyIssueId] = useState<string | null>(null);
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

  const sortedIssues = useMemo(
    () => sortIssues(issues, sortMode, nowMs, user?.uid),
    [issues, nowMs, sortMode, user?.uid],
  );

  async function handleClaim(issueId: string) {
    if (!user) {
      router.push("/auth");
      return;
    }

    setBusyIssueId(issueId);
    setError(null);

    try {
      await postAuthedJson("/api/issues/claim", { issueId });
      router.push("/tasks");
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Claim failed.");
    } finally {
      setBusyIssueId(null);
    }
  }

  return (
    <AppShell
      title="Issue Board"
      subtitle="Scan the full list of reported problems, sort by reward value or availability, and pick the task that fits you best."
      actions={
        <select
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as SortMode)}
          className="rounded-full border border-[#d8d0c3] bg-white/85 px-4 py-3 text-sm font-semibold text-[#123524]"
        >
          <option value="newest">Newest first</option>
          <option value="points">Highest points</option>
          <option value="available">Available first</option>
          <option value="claimed">Claimed first</option>
        </select>
      }
    >
      {error ? (
        <div className="mb-5 rounded-[26px] border border-[#f0b7b7] bg-[#fff1f1] px-4 py-3 text-sm text-[#a63f3f]">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#47624b]" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-[30px] border border-[#d8d0c3] bg-white">
          <div className="grid grid-cols-[minmax(0,1.8fr)_130px_140px_170px] gap-4 border-b border-[#efe4d2] px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#6d7f71]">
            <div>Issue</div>
            <div>Points</div>
            <div>Status</div>
            <div>Action</div>
          </div>

          <div className="divide-y divide-[#efe4d2]">
            {sortedIssues.map((issue) => {
              const view = getIssueView(issue, nowMs, user?.uid);

              return (
                <div
                  key={issue.id}
                  className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-[minmax(0,1.8fr)_130px_140px_170px]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#123524]">
                      {issue.description}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#6d7f71]">
                      {issue.reporter_name ?? "Community member"}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-[#8f4b11]">
                    {issue.point_value} pts
                  </div>
                  <div className="text-sm font-semibold text-[#123524]">
                    {view.statusLabel}
                  </div>
                  <div>
                    {view.canClaim ? (
                      <button
                        type="button"
                        onClick={() => void handleClaim(issue.id)}
                        disabled={busyIssueId === issue.id}
                        className="inline-flex items-center gap-2 rounded-full bg-[#123524] px-4 py-2 text-sm font-semibold text-[#f7f1e7] disabled:opacity-60"
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
                        className="rounded-full border border-[#123524] px-4 py-2 text-sm font-semibold text-[#123524]"
                      >
                        Continue
                      </button>
                    ) : (
                      <span className="text-sm text-[#6d7f71]">Watch</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
