"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { LoaderCircle, TimerReset, Wrench } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { postAuthedJson } from "@/lib/client-api";
import { db, storage } from "@/lib/firebase";
import { getIssueView } from "@/lib/issue-lifecycle";
import { IssueRecord } from "@/lib/types";

export default function FixIssuePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { loading, user } = useAuth();
  const [issue, setIssue] = useState<IssueRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [issueLoaded, setIssueLoaded] = useState(false);
  const [extensionReason, setExtensionReason] = useState("");
  const [progressNote, setProgressNote] = useState("");
  const [requestingExtension, setRequestingExtension] = useState(false);
  const missingIssueId = !params.id;

  useEffect(() => {
    if (missingIssueId) {
      return;
    }

    return onSnapshot(
      doc(db, "issues", params.id),
      (snapshot) => {
        if (!snapshot.exists()) {
          setIssue(null);
          setError("This issue could not be found.");
          setIssueLoaded(true);
          return;
        }

        setIssue({
          id: snapshot.id,
          ...(snapshot.data() as Omit<IssueRecord, "id">),
        });
        setError(null);
        setIssueLoaded(true);
      },
      () => {
        setIssue(null);
        setError("Unable to load this issue right now.");
        setIssueLoaded(true);
      },
    );
  }, [missingIssueId, params.id]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !issue || !file) {
      setError("An after photo is required.");
      return;
    }

    const issueView = getIssueView(issue, Date.now(), user.uid);

    if (!issueView.canSubmitProof) {
      setError("This task is not active for your account anymore.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const extension = file.name.split(".").pop() ?? "jpg";
      const storageRef = ref(
        storage,
        `issues/after/${user.uid}/${issue.id}-${Date.now()}.${extension}`,
      );

      await uploadBytes(storageRef, file, {
        contentType: file.type,
      });

      const afterPhotoUrl = await getDownloadURL(storageRef);

      await postAuthedJson("/api/issues/complete", {
        issueId: issue.id,
        afterPhotoUrl,
      });

      router.push("/tasks");
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to submit repair proof.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExtensionRequest() {
    if (!issue) {
      return;
    }

    setRequestingExtension(true);
    setError(null);

    try {
      await postAuthedJson("/api/issues/extension", {
        issueId: issue.id,
        progressNote,
        reason: extensionReason,
      });
      setExtensionReason("");
      setProgressNote("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Extension request failed.",
      );
    } finally {
      setRequestingExtension(false);
    }
  }

  return (
    <AppShell
      title="Continue Task"
      subtitle="Submit repair proof."
    >
      {missingIssueId ? (
        <div className="rounded-[30px] border border-[#f0b7b7] bg-[#fff1f1] px-5 py-10 text-center text-sm text-[#a63f3f]">
          Missing issue id.
        </div>
      ) : !issue && !issueLoaded ? (
        <div className="rounded-[30px] border border-dashed border-[#cbbfaa] bg-white/70 px-5 py-10 text-center text-sm text-[#47624b]">
          Loading issue details...
        </div>
      ) : !issue ? (
        <div className="rounded-[30px] border border-[#f0b7b7] bg-[#fff1f1] px-5 py-10 text-center text-sm text-[#a63f3f]">
          {error ?? "This issue could not be loaded."}
        </div>
      ) : (
        <div className="space-y-8 px-5 py-8 md:px-8 md:py-10">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tasks"
              className="inline-flex items-center rounded-full border border-[#d8c4b2] bg-[#fffaf3] px-4 py-2 text-sm font-semibold text-[#7b1917]"
            >
              Task tab
            </Link>
            <span className="inline-flex items-center rounded-full bg-[#8e0d0d] px-4 py-2 text-sm font-semibold text-white">
              Continue task
            </span>
          </div>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.95fr)]">
          <div className="overflow-hidden rounded-[30px] border border-[#d8d0c3] bg-white shadow-[0_20px_50px_rgba(77,28,25,0.08)]">
            <div className="relative aspect-[16/10]">
              <Image
                src={issue.before_photo_url}
                alt={issue.description}
                fill
                className="object-cover"
                sizes="(max-width: 1279px) 100vw, 55vw"
              />
            </div>
            <div className="space-y-5 p-6 md:p-7">
              <p className="text-sm leading-7 text-[#2c4633]">{issue.description}</p>
              <p className="text-sm font-semibold text-[#8f4b11]">
                Reward: {issue.point_value} points
              </p>
              {issue.claim_expires_at_ms ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-[#fff4e6] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f4b11]">
                  <TimerReset className="h-4 w-4" />
                  Claim deadline: {new Date(issue.claim_expires_at_ms).toLocaleString()}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
              <label className="block rounded-[30px] border border-dashed border-[#cbbfaa] bg-white/80 p-6">
                <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#123524]">
                  <Wrench className="h-4 w-4" />
                  Completed task proof
                </span>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null;

                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                    }

                    setFile(nextFile);
                    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
                  }}
                  className="w-full text-sm text-[#47624b]"
                />
                {previewUrl ? (
                  <div className="relative mt-4 h-64 w-full overflow-hidden rounded-[24px]">
                    <Image
                      src={previewUrl}
                      alt="Repair preview"
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 1279px) 100vw, 40vw"
                    />
                  </div>
                ) : null}
              </label>

              {error ? (
                <div className="rounded-3xl border border-[#f0b7b7] bg-[#fff1f1] px-4 py-3 text-sm text-[#a63f3f]">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting || loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#123524] px-4 py-3 text-sm font-semibold text-[#f7f1e7] disabled:opacity-70"
              >
                {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                Submit proof for review
              </button>
            </form>

            <div className="rounded-[30px] border border-[#d8d0c3] bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#47624b]">
                Need more time?
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#47624b]">
                If the 24-hour window is too short, submit a short progress note.
                The app grants one extra 12-hour extension when there is visible progress.
              </p>
              <div className="mt-4 space-y-3">
                <input
                  value={extensionReason}
                  onChange={(event) => setExtensionReason(event.target.value)}
                  placeholder="Why do you need more time?"
                  className="w-full rounded-3xl border border-[#d8d0c3] bg-[#fffaf3] px-4 py-3 text-sm text-[#123524]"
                />
                <textarea
                  value={progressNote}
                  onChange={(event) => setProgressNote(event.target.value)}
                  rows={4}
                  placeholder="Explain what progress you already made on the task..."
                  className="w-full resize-none rounded-[24px] border border-[#d8d0c3] bg-[#fffaf3] px-4 py-3 text-sm leading-6 text-[#123524]"
                />
                <button
                  type="button"
                  onClick={() => void handleExtensionRequest()}
                  disabled={requestingExtension}
                  className="inline-flex items-center gap-2 rounded-full border border-[#123524] px-4 py-3 text-sm font-semibold text-[#123524] disabled:opacity-60"
                >
                  {requestingExtension ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : null}
                  Request 12h extension
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </AppShell>
  );
}
