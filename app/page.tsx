"use client";

import { useRouter } from "next/navigation";
import { FirestoreError, collection, onSnapshot } from "firebase/firestore";
import { LoaderCircle } from "lucide-react";
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
      (snapshotError: FirestoreError) => {
        setIssues([]);
        setError(
          snapshotError.message || "Unable to load the live issue feed right now.",
        );
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
      title="Home Board"
      subtitle="Stay connected with your community by exploring the latest posts, events, and accomplishments."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="rounded-full border border-white/35 bg-white px-4 py-3 text-sm font-semibold text-[#321817]">
            {availableCount} tasks available
          </div>
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
      ) : issues.length ? (
        <div className="mx-auto max-w-[920px] bg-white pb-10 pt-2">
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
        <div className="mx-5 mt-5 rounded-[24px] border border-dashed border-[#d1b7a4] bg-[#fffdf8] px-5 py-10 text-center md:mx-8">
          <p className="font-display text-3xl text-[#8e0d0d]">No reports yet</p>
          <p className="mt-3 text-sm leading-6 text-[#6d5752]">
            Be the first person to report a cleanup problem in the area.
          </p>
        </div>
      )}
    </AppShell>
  );
}
