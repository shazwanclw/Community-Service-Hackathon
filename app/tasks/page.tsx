"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
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

export default function TasksPage() {
  const router = useRouter();
  const { loading, user } = useAuth();
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <AppShell
      title="My Tasks"
      subtitle="Track the jobs you have taken, submit proof before the timer ends, and watch what is waiting for review."
    >
      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#47624b]" />
        </div>
      ) : error ? (
        <div className="rounded-[26px] border border-[#f0b7b7] bg-[#fff1f1] px-4 py-3 text-sm text-[#a63f3f]">
          {error}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          {[
            { items: activeTasks, title: "Active claims", empty: "No active claims." },
            { items: pendingTasks, title: "Waiting for review", empty: "No submissions waiting for review." },
            { items: resolvedTasks, title: "Completed", empty: "No approved tasks yet." },
          ].map((section) => (
            <section
              key={section.title}
              className="rounded-[30px] border border-[#d8d0c3] bg-white p-5"
            >
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#47624b]">
                {section.title}
              </h2>
              <div className="mt-4 space-y-3">
                {section.items.length ? (
                  section.items.map((issue) => (
                    <div key={issue.id} className="rounded-[24px] bg-[#f8f2e8] p-4">
                      <p className="text-sm font-semibold text-[#123524]">
                        {issue.description}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#6d7f71]">
                        {issue.point_value} pts
                      </p>
                      <Link
                        href={`/issues/${issue.id}/fix`}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#123524] px-4 py-2 text-sm font-semibold text-[#f7f1e7]"
                      >
                        Open task
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-[#47624b]">{section.empty}</p>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}
