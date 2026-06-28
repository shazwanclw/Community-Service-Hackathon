"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { isAdmin, loading, user } = useAuth();
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, router, user]);

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
      {error ? (
        <div className="mb-4 rounded-3xl border border-[#f0b7b7] bg-[#fff1f1] px-4 py-3 text-sm text-[#a63f3f]">
          {error}
        </div>
      ) : null}
      {loadError ? (
        <div className="mb-4 rounded-3xl border border-[#f0b7b7] bg-[#fff1f1] px-4 py-3 text-sm text-[#a63f3f]">
          {loadError}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#47624b]" />
        </div>
      ) : !loadError && issues.length ? (
        <div className="space-y-4">
          {issues.map((issue) => (
            <article
              key={issue.id}
              className="rounded-[30px] border border-[#d8d0c3] bg-white p-5 shadow-[0_18px_40px_rgba(18,53,36,0.08)]"
            >
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_320px]">
                <div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#47624b]">
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
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#47624b]">
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

                  <p className="mt-4 text-sm leading-6 text-[#2c4633]">
                    {issue.description}
                  </p>
                </div>

                <div className="flex flex-col justify-between rounded-[26px] bg-[#f8f2e8] p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#47624b]">
                      Moderation action
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#47624b]">
                      Release points only if the repair is complete and the
                      after-photo evidence clearly resolves the issue.
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#f4a261]/18 px-3 py-1 text-sm font-bold text-[#8f4b11]">
                      {issue.point_value} pts
                    </span>
                    <button
                      type="button"
                      onClick={() => void approveIssue(issue.id)}
                      disabled={approvingId === issue.id}
                      className="inline-flex items-center gap-2 rounded-full bg-[#123524] px-4 py-3 text-sm font-semibold text-[#f7f1e7] disabled:opacity-70"
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
      ) : (
        <div className="rounded-[30px] border border-dashed border-[#cbbfaa] bg-white/70 px-5 py-10 text-center">
          <p className="font-display text-3xl text-[#123524]">Queue is clear</p>
          <p className="mt-3 text-sm leading-6 text-[#47624b]">
            No pending repair submissions are waiting for moderation.
          </p>
        </div>
      )}
    </AppShell>
  );
}
