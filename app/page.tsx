"use client";

import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { IssueCard } from "@/components/issue-card";
import { db } from "@/lib/firebase";
import { IssueRecord } from "@/lib/types";

function sortIssues(issues: IssueRecord[]) {
  return [...issues].sort((a, b) => {
    const aMillis = a.created_at?.toMillis?.() ?? 0;
    const bMillis = b.created_at?.toMillis?.() ?? 0;
    return bMillis - aMillis;
  });
}

export default function HomePage() {
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "issues"), where("status", "==", "open"));

    return onSnapshot(
      q,
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
        setError("Unable to load the live hazard feed right now.");
        setLoading(false);
      },
    );
  }, []);

  return (
    <AppShell
      title="Mentari Feed"
      subtitle="Browse open hazards, pick a repair you can handle, and turn visible action into community points."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <Link
            href="/report"
            className="inline-flex items-center gap-2 rounded-full bg-[#f4a261] px-4 py-3 text-sm font-semibold text-[#123524] shadow-[0_10px_30px_rgba(244,162,97,0.25)]"
          >
            Report a hazard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="rounded-full border border-[#d4c6b0] bg-white/85 px-4 py-3 text-sm font-semibold text-[#47624b]">
            {issues.length} open tasks
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#47624b]" />
        </div>
      ) : error ? (
        <div className="rounded-[30px] border border-[#f0b7b7] bg-[#fff1f1] px-5 py-10 text-center">
          <p className="font-display text-3xl text-[#123524]">Feed unavailable</p>
          <p className="mt-3 text-sm leading-6 text-[#a63f3f]">{error}</p>
        </div>
      ) : issues.length ? (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} showFixAction />
          ))}
        </div>
      ) : (
        <div className="rounded-[30px] border border-dashed border-[#cbbfaa] bg-white/70 px-5 py-10 text-center">
          <p className="font-display text-3xl text-[#123524]">All clear for now</p>
          <p className="mt-3 text-sm leading-6 text-[#47624b]">
            There are no open hazards in the feed. Submit a new report to keep
            the community map current.
          </p>
        </div>
      )}
    </AppShell>
  );
}
