"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";

type LeaderboardEntry = UserProfile & {
  id: string;
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(
      query(collection(db, "users"), orderBy("total_points", "desc")),
      (snapshot) => {
        setEntries(
          snapshot.docs.map((docSnapshot) => ({
            id: docSnapshot.id,
            ...(docSnapshot.data() as UserProfile),
          })),
        );
        setError(null);
        setLoading(false);
      },
      () => {
        setEntries([]);
        setError("Unable to load the leaderboard right now.");
        setLoading(false);
      },
    );
  }, []);

  return (
    <AppShell
      title="Leaderboard"
      subtitle="See how many verified points each member has earned and where you stand in the community."
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
        <div className="overflow-hidden rounded-[30px] border border-[#d8d0c3] bg-white">
          <div className="grid grid-cols-[80px_minmax(0,1fr)_140px] gap-4 border-b border-[#efe4d2] px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#6d7f71]">
            <div>Rank</div>
            <div>Member</div>
            <div>Points</div>
          </div>
          <div className="divide-y divide-[#efe4d2]">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`grid grid-cols-[80px_minmax(0,1fr)_140px] gap-4 px-5 py-4 ${
                  entry.id === user?.uid ? "bg-[#fff7eb]" : ""
                }`}
              >
                <div className="text-sm font-bold text-[#123524]">#{index + 1}</div>
                <div>
                  <p className="text-sm font-semibold text-[#123524]">
                    {entry.full_name || entry.email}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#6d7f71]">
                    {entry.email}
                  </p>
                </div>
                <div className="text-sm font-bold text-[#8f4b11]">
                  {entry.total_points}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
