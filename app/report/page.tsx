"use client";

import Image from "next/image";
import { addDoc, collection, doc, increment, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Camera, ImagePlus, LoaderCircle, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { db, storage } from "@/lib/firebase";
import { HazardScore } from "@/lib/types";

const REPORT_REWARD_POINTS = 10;

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Failed to read file."));
        return;
      }

      const [, base64 = ""] = result.split(",");
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export default function ReportPage() {
  const { loading, profile, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [captionLoading, setCaptionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  function updateFiles(nextFiles: File[]) {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setFiles(nextFiles);
    setPreviewUrls(nextFiles.map((file) => URL.createObjectURL(file)));
  }

  function appendFiles(nextSelection: File[]) {
    const combined = [...files, ...nextSelection].slice(0, 3);
    updateFiles(combined);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !files.length) {
      setError("Please add at least one hazard photo before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const nextDescription = String(formData.get("description") ?? "").trim();
    const nextLocation = String(formData.get("location") ?? "").trim();

    try {
      const uploads = await Promise.all(
        files.map(async (file, index) => {
          const extension = file.name.split(".").pop() ?? "jpg";
          const storageRef = ref(
            storage,
            `issues/before/${user.uid}/${Date.now()}-${index}.${extension}`,
          );

          await uploadBytes(storageRef, file, {
            contentType: file.type,
          });

          return getDownloadURL(storageRef);
        }),
      );

      const scoringFile = files[0];
      const imageBase64 = await fileToBase64(scoringFile);

      const response = await fetch("/api/score-hazard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64,
          mimeType: scoringFile.type,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(payload?.error ?? "Failed to score the hazard image.");
      }

      const score = (await response.json()) as HazardScore;
      const reporterName =
        profile?.full_name?.trim() || user.displayName || user.email || "Community member";
      const reporterUsername = profile?.username?.trim() || null;
      const pointStatus = score.point_status ?? "scored";
      const pointValue = pointStatus === "pending_admin_review" ? 0 : score.total_points;

      await addDoc(collection(db, "issues"), {
        reporter_id: user.uid,
        reporter_name: reporterName,
        reporter_profile_photo_url: profile?.profile_photo_url ?? null,
        reporter_username: reporterUsername,
        fixer_id: null,
        status: "open",
        description: nextDescription,
        location: nextLocation,
        before_photo_url: uploads[0],
        before_photo_urls: uploads,
        after_photo_url: null,
        point_value: pointValue,
        point_status: pointStatus,
        point_source: score.point_source ?? "ai",
        point_status_label: score.point_status_label ?? null,
        created_at: serverTimestamp(),
        claim_expires_at_ms: null,
        claimed_at_ms: null,
        extension_status: "none",
        extension_reason: null,
        extension_progress_note: null,
        extension_requested_at_ms: null,
        liked_by: [],
        comments: [],
      });

      await setDoc(
        doc(db, "users", user.uid),
        {
          total_points: increment(REPORT_REWARD_POINTS),
        },
        { merge: true },
      );

      setFiles([]);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      setDescription("");
      setLocation("");
      setSuccessMessage(
        pointStatus === "pending_admin_review"
          ? `Report submitted. You earned ${REPORT_REWARD_POINTS} points. Task points are waiting for admin approval.`
          : `Report submitted. You earned ${REPORT_REWARD_POINTS} points.`,
      );
      event.currentTarget.reset();
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to submit hazard report.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGenerateCaption() {
    if (!files.length) {
      setError("Add at least one image before asking AI to write the issue details.");
      return;
    }

    setCaptionLoading(true);
    setError(null);

    try {
      const imageBase64 = await fileToBase64(files[0]);
      const response = await fetch("/api/report-caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64,
          mimeType: files[0].type,
          location,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { caption?: string; error?: string }
        | null;

      if (!response.ok || !payload?.caption) {
        throw new Error(payload?.error ?? "AI caption generation failed.");
      }

      setDescription(payload.caption);
    } catch (captionError) {
      setError(
        captionError instanceof Error
          ? captionError.message
          : "AI caption generation failed.",
      );
    } finally {
      setCaptionLoading(false);
    }
  }

  return (
    <AppShell
      title="Report Board"
      subtitle="Upload the issue photos, explain what happened, and earn 10 points."
    >
      <div className="px-4 py-5 sm:px-5 md:px-8 md:py-8">
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="mx-auto w-full max-w-[920px] space-y-4 rounded-[22px] border border-[#d8c4b2] bg-[#fffdf8] p-4 shadow-[0_14px_36px_rgba(77,28,25,0.08)] sm:space-y-5 sm:p-5 md:p-6"
        >
          <section className="rounded-[18px] border border-[#eadbcc] bg-[#fbf7ef] p-4 md:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3e0d7] text-[#8e0d0d]">
                <ImagePlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#321817]">Images to report</h2>
                <p className="text-sm text-[#7c6761]">Upload up to 3 images.</p>
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="report-photos"
                className="flex cursor-pointer items-center justify-center rounded-[16px] border border-dashed border-[#d8c4b2] bg-white px-4 py-8 text-center text-sm font-semibold text-[#8e0d0d]"
              >
                <span className="inline-flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Choose images
                </span>
              </label>
              <input
                id="report-photos"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  const nextFiles = Array.from(event.target.files ?? []).slice(0, 3);
                  appendFiles(nextFiles);
                  event.currentTarget.value = "";
                }}
                className="sr-only"
              />
            </div>

            {previewUrls.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {previewUrls.map((previewUrl, index) => (
                  <div
                    key={previewUrl}
                    className="relative overflow-hidden rounded-[16px] border border-[#eadbcc] bg-white"
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={previewUrl}
                        alt={`Hazard preview ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 1023px) 50vw, 25vw"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateFiles(files.filter((_, currentIndex) => currentIndex !== index))
                      }
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {files.length < 3 ? (
              <div className="mt-4">
                <label
                  htmlFor="report-photos"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d8c4b2] bg-white px-4 py-2 text-sm font-semibold text-[#8e0d0d]"
                >
                  <ImagePlus className="h-4 w-4" />
                  Add image
                </label>
              </div>
            ) : null}
          </section>

          <section className="rounded-[18px] border border-[#eadbcc] bg-[#fbf7ef] p-4 md:p-5">
            <h2 className="text-lg font-semibold text-[#321817]">Where it happens</h2>
            <p className="mt-1 text-sm text-[#7c6761]">
              Add the location so people know where to find the issue.
            </p>
            <input
              name="location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
              placeholder="Example: Block C parking lot"
              className="mt-4 w-full rounded-[16px] border border-[#d8c4b2] bg-white px-4 py-3 text-[16px] text-[#321817] outline-none placeholder:text-[#b9aca4]"
            />
          </section>

          <section className="rounded-[18px] border border-[#eadbcc] bg-[#fbf7ef] p-4 md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#321817]">Issue details</h2>
                <p className="mt-1 text-sm text-[#7c6761]">
                  Explain clearly what the problem is and where it happened.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleGenerateCaption()}
                disabled={captionLoading || !files.length}
                className="inline-flex items-center gap-2 rounded-full border border-[#d8c4b2] bg-white px-4 py-2 text-sm font-semibold text-[#8e0d0d] disabled:opacity-60"
              >
                {captionLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                AI caption
              </button>
            </div>
            <textarea
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              rows={6}
              placeholder="Describe the issue..."
              className="mt-4 w-full resize-none rounded-[16px] border border-[#d8c4b2] bg-white px-4 py-4 text-[16px] leading-6 text-[#321817] outline-none placeholder:text-[#b9aca4]"
            />
          </section>

          {error ? (
            <div className="rounded-[18px] border border-[#f0b7b7] bg-[#fff1f1] px-4 py-3 text-sm text-[#a63f3f]">
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-[18px] border border-[#cfe6d4] bg-[#eef8f1] px-4 py-3 text-sm text-[#2d5a36]">
              {successMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#b51507] px-4 py-3 text-[18px] font-semibold text-white disabled:opacity-70"
          >
            {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Report
          </button>
        </form>
      </div>
    </AppShell>
  );
}
