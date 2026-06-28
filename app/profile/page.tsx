"use client";

import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { IssueRecord } from "@/lib/types";

export default function ProfilePage() {
  const { loading, profile, user } = useAuth();
  const [reportedIssues, setReportedIssues] = useState<IssueRecord[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    return onSnapshot(
      query(collection(db, "issues"), where("reporter_id", "==", user.uid)),
      (snapshot) => {
        setReportedIssues(
          snapshot.docs.map((docSnapshot) => ({
            id: docSnapshot.id,
            ...(docSnapshot.data() as Omit<IssueRecord, "id">),
          })),
        );
      },
    );
  }, [user]);

  const approvedReports = useMemo(
    () => reportedIssues.filter((issue) => issue.status === "approved").length,
    [reportedIssues],
  );

  return (
    <AppShell
      title="Profile"
      subtitle="See your account, how many reports you created, and how many community tasks have reached completion."
    >
      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#47624b]" />
        </div>
      ) : !user ? (
        <div className="rounded-[30px] border border-dashed border-[#cbbfaa] bg-white/70 px-5 py-10 text-center">
          <p className="font-display text-3xl text-[#123524]">Sign in first</p>
          <p className="mt-3 text-sm leading-6 text-[#47624b]">
            Your profile becomes available after you log in.
          </p>
          <Link
            href="/auth"
            className="mt-5 inline-flex rounded-full bg-[#123524] px-4 py-3 text-sm font-semibold text-[#f7f1e7]"
          >
            Go to auth
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-[30px] bg-[#123524] p-6 text-[#f7f1e7]">
            <p className="text-xs uppercase tracking-[0.22em] text-[#d2e1d7]">
              Community account
            </p>
            <p className="mt-3 font-display text-5xl leading-none">
              {profile?.full_name ?? user.email}
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#d2e1d7]">
                  Total points
                </p>
                <p className="mt-2 text-3xl font-bold">{profile?.total_points ?? 0}</p>
              </div>
              <div className="rounded-[24px] bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#d2e1d7]">
                  Reports posted
                </p>
                <p className="mt-2 text-3xl font-bold">{reportedIssues.length}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-[#d8d0c3] bg-white p-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#47624b]">
              Report summary
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-[#f8f2e8] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#6d7f71]">
                  Resolved reports
                </p>
                <p className="mt-2 text-3xl font-bold text-[#123524]">
                  {approvedReports}
                </p>
              </div>
              <div className="rounded-[24px] bg-[#f8f2e8] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#6d7f71]">
                  Still active
                </p>
                <p className="mt-2 text-3xl font-bold text-[#123524]">
                  {reportedIssues.length - approvedReports}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {reportedIssues.slice(0, 5).map((issue) => (
                <div key={issue.id} className="rounded-[24px] bg-[#fffaf3] px-4 py-3">
                  <p className="text-sm font-semibold text-[#123524]">
                    {issue.description}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#6d7f71]">
                    {issue.status} · {issue.point_value} pts
                  </p>
                </div>
              ))}
              {!reportedIssues.length ? (
                <p className="text-sm leading-6 text-[#47624b]">
                  You have not posted any issue reports yet.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
