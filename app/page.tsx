"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { IssueCard } from "@/components/issue-card";
import { db } from "@/lib/firebase";
import { postAuthedJson } from "@/lib/client-api";
import { getIssueView } from "@/lib/issue-lifecycle";
import { IssueRecord } from "@/lib/types";
import { useLiveNow } from "@/lib/use-live-now";

function sortIssues(issues: IssueRecord[]) {
  return [...issues].sort((a, b) => {
    const aMillis = a.created_at?.toMillis?.() ?? 0;
    const bMillis = b.created_at?.toMillis?.() ?? 0;
    return bMillis - aMillis;
  });
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const nowMs = useLiveNow();

  useEffect(() => {
    return onSnapshot(
      collection(db, "issues"),
      (snapshot) => {
        const nextIssues = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...(docSnapshot.data() as Omit<IssueRecord, "id">),
        }));

        setIssues(sortIssues(nextIssues));
        setError(null);
        setLoading(false);
      },
      () => {
        setIssues([]);
        setError("Unable to load the live issue feed right now.");
        setLoading(false);
      },
    );
  }, []);

  const availableCount = useMemo(
    () =>
      issues.filter((issue) => getIssueView(issue, nowMs, user?.uid).phase === "available")
        .length,
    [issues, nowMs, user?.uid],
  );

  async function runAuthedAction(
    busyId: string,
    action: () => Promise<void>,
  ) {
    if (!user) {
      router.push("/auth");
      return;
    }

    setBusyKey(busyId);
    setError(null);

    try {
      await action();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Action failed.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <AppShell
      title="Community Feed"
      subtitle="Scroll through reported problems like a live neighborhood feed, react to updates, and pick a task when you are ready to fix it."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <Link
            href="/report"
            className="inline-flex items-center gap-2 rounded-full bg-[#f4a261] px-4 py-3 text-sm font-semibold text-[#123524] shadow-[0_10px_30px_rgba(244,162,97,0.25)]"
          >
            Report a problem
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="rounded-full border border-[#d4c6b0] bg-white/85 px-4 py-3 text-sm font-semibold text-[#47624b]">
            {availableCount} tasks available
          </div>
        </div>
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
      ) : issues.length ? (
        <div className="mx-auto grid max-w-[820px] gap-6">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              busyAction={
                busyKey === `${issue.id}:claim`
                  ? "claim"
                  : busyKey === `${issue.id}:like`
                    ? "like"
                    : busyKey === `${issue.id}:comment`
                      ? "comment"
                      : null
              }
              issue={issue}
              viewerId={user?.uid}
              onClaim={(currentIssue) =>
                runAuthedAction(`${currentIssue.id}:claim`, async () => {
                  await postAuthedJson("/api/issues/claim", {
                    issueId: currentIssue.id,
                  });
                  router.push("/tasks");
                })
              }
              onComment={(currentIssue, text) =>
                runAuthedAction(`${currentIssue.id}:comment`, async () => {
                  await postAuthedJson("/api/issues/comment", {
                    issueId: currentIssue.id,
                    text,
                  });
                })
              }
              onLike={(currentIssue) =>
                runAuthedAction(`${currentIssue.id}:like`, async () => {
                  await postAuthedJson("/api/issues/like", {
                    issueId: currentIssue.id,
                  });
                })
              }
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[30px] border border-dashed border-[#cbbfaa] bg-white/70 px-5 py-10 text-center">
          <p className="font-display text-3xl text-[#123524]">No reports yet</p>
          <p className="mt-3 text-sm leading-6 text-[#47624b]">
            Be the first person to report a cleanup problem in the area.
          </p>
        </div>
      )}
    </AppShell>
  );
}
