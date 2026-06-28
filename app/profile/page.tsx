"use client";

import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Gift, LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { IssueRecord, RewardItem } from "@/lib/types";

const mockRewards: RewardItem[] = [
  { item_name: "RM10 Grocery Voucher", point_cost: 120 },
  { item_name: "Community Cafe Combo", point_cost: 80 },
  { item_name: "Transit Top-Up Bonus", point_cost: 200 },
];

export default function ProfilePage() {
  const { loading, profile, user } = useAuth();
  const [userIssues, setUserIssues] = useState<IssueRecord[]>([]);
  const [issuesError, setIssuesError] = useState<string | null>(null);

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

        nextIssues.sort((a, b) => {
          const aMillis = a.created_at?.toMillis?.() ?? 0;
          const bMillis = b.created_at?.toMillis?.() ?? 0;
          return bMillis - aMillis;
        });

        setUserIssues(nextIssues);
        setIssuesError(null);
      },
      () => {
        setUserIssues([]);
        setIssuesError("Recent repair activity is temporarily unavailable.");
      },
    );
  }, [user]);

  const approvedCount = useMemo(
    () => userIssues.filter((issue) => issue.status === "approved").length,
    [userIssues],
  );
  const visibleIssuesError = user ? issuesError : null;

  return (
    <AppShell
      title="Wallet"
      subtitle="Track earned points, review repair activity, and see what the next reward tier unlocks."
    >
      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#47624b]" />
        </div>
      ) : !user ? (
        <div className="rounded-[30px] border border-dashed border-[#cbbfaa] bg-white/70 px-5 py-10 text-center">
          <p className="font-display text-3xl text-[#123524]">Sign in first</p>
          <p className="mt-3 text-sm leading-6 text-[#47624b]">
            Your wallet and repair history appear after you log in.
          </p>
          <Link
            href="/auth"
            className="mt-5 inline-flex rounded-full bg-[#123524] px-4 py-3 text-sm font-semibold text-[#f7f1e7]"
          >
            Go to auth
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[30px] bg-[#123524] p-5 text-[#f7f1e7]">
              <p className="text-xs uppercase tracking-[0.22em] text-[#d2e1d7]">
                Points balance
              </p>
              <p className="mt-2 font-display text-6xl leading-none">
                {profile?.total_points ?? 0}
              </p>
            </div>
            <div className="rounded-[30px] border border-[#d8d0c3] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[#6d7f71]">
                Approved repairs
              </p>
              <p className="mt-2 font-display text-5xl leading-none text-[#123524]">
                {approvedCount}
              </p>
              <div className="mt-4 flex items-center gap-3 text-sm text-[#47624b]">
                <Sparkles className="h-4 w-4" />
                Verified work adds directly to your balance.
              </div>
            </div>
            <div className="rounded-[30px] border border-[#d8d0c3] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[#6d7f71]">
                Activity in queue
              </p>
              <p className="mt-2 font-display text-5xl leading-none text-[#123524]">
                {userIssues.length}
              </p>
              <p className="mt-4 text-sm leading-6 text-[#47624b]">
                Track submissions, approvals, and what you can redeem next.
              </p>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <section className="rounded-[30px] border border-[#d8d0c3] bg-white p-5">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-[#8f4b11]" />
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#47624b]">
                  Mock rewards
                </h2>
              </div>
              <div className="mt-4 space-y-3">
                {mockRewards.map((reward) => (
                  <div
                    key={reward.item_name}
                    className="flex items-center justify-between rounded-[24px] bg-[#f8f2e8] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#123524]">
                        {reward.item_name}
                      </p>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#6d7f71]">
                        Reward item
                      </p>
                    </div>
                    <span className="rounded-full bg-[#f4a261]/18 px-3 py-1 text-sm font-bold text-[#8f4b11]">
                      {reward.point_cost} pts
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[30px] border border-[#d8d0c3] bg-white p-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#47624b]">
                Recent fix activity
              </h2>

              <div className="mt-4 space-y-3">
                {visibleIssuesError ? (
                  <p className="text-sm leading-6 text-[#a63f3f]">
                    {visibleIssuesError}
                  </p>
                ) : userIssues.length ? (
                  userIssues.slice(0, 5).map((issue) => (
                    <div
                      key={issue.id}
                      className="rounded-[24px] bg-[#f8f2e8] px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-[#123524]">
                        {issue.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[#6d7f71]">
                        <span>{issue.status}</span>
                        <span>{issue.point_value} pts</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-[#47624b]">
                    No fix submissions yet. Claim an open issue from the feed to
                    start earning points.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </AppShell>
  );
}
