"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Camera, LoaderCircle } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { db, storage } from "@/lib/firebase";

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
  const router = useRouter();
  const { loading, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, router, user]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !file) {
      setError("Please add a hazard photo before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const description = String(formData.get("description") ?? "").trim();

    try {
      const extension = file.name.split(".").pop() ?? "jpg";
      const storageRef = ref(
        storage,
        `issues/before/${user.uid}/${Date.now()}.${extension}`,
      );

      await uploadBytes(storageRef, file, {
        contentType: file.type,
      });

      const [beforePhotoUrl, imageBase64] = await Promise.all([
        getDownloadURL(storageRef),
        fileToBase64(file),
      ]);

      const response = await fetch("/api/score-hazard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64,
          mimeType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to score the hazard image.");
      }

      const score = (await response.json()) as { total_points: number };

      await addDoc(collection(db, "issues"), {
        reporter_id: user.uid,
        fixer_id: null,
        status: "open",
        description,
        before_photo_url: beforePhotoUrl,
        after_photo_url: null,
        point_value: score.total_points,
        created_at: serverTimestamp(),
      });

      router.push("/");
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

  return (
    <AppShell
      title="Report"
      subtitle="Snap the issue where it is, explain the problem clearly, and let Gemini estimate a fair point value."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <label className="block rounded-[30px] border border-dashed border-[#cbbfaa] bg-white/80 p-5">
            <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#123524]">
              <Camera className="h-4 w-4" />
              Before photo
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
          </label>

          <label className="block rounded-[30px] border border-[#d8d0c3] bg-white/80 p-5">
            <span className="mb-3 block text-sm font-semibold text-[#123524]">
              Description
            </span>
            <textarea
              name="description"
              required
              rows={6}
              className="w-full resize-none rounded-[24px] border border-[#e3d7c6] bg-[#fffaf3] px-4 py-3 text-sm leading-6 text-[#123524]"
              placeholder="Example: Broken drain cover beside Block B playground. Sharp edges exposed and dangerous at night."
            />
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
            Submit report
          </button>
        </form>

        <aside className="space-y-4">
          <div className="rounded-[30px] bg-[#123524] p-6 text-[#f7f1e7]">
            <p className="text-xs uppercase tracking-[0.22em] text-[#d2e1d7]">
              Field note
            </p>
            <p className="mt-3 font-display text-4xl leading-none">
              Make the issue obvious.
            </p>
            <p className="mt-3 text-sm leading-6 text-[#d9e7de]">
              A strong photo and a precise description help the scoring model
              estimate effort fairly and help fixers understand the job fast.
            </p>
          </div>

          <div className="rounded-[30px] border border-[#d8d0c3] bg-white/85 p-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#47624b]">
              Submission preview
            </h2>
            {previewUrl ? (
              <div className="relative mt-4 h-64 w-full overflow-hidden rounded-[24px]">
                <Image
                  src={previewUrl}
                  alt="Hazard preview"
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 1279px) 100vw, 40vw"
                />
              </div>
            ) : (
              <div className="mt-4 rounded-[24px] border border-dashed border-[#d8d0c3] bg-[#fffaf3] px-4 py-10 text-center text-sm leading-6 text-[#6d7f71]">
                Your uploaded hazard image will appear here so you can verify it
                before submitting.
              </div>
            )}
          </div>

          <div className="rounded-[30px] border border-[#d8d0c3] bg-white/85 p-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#47624b]">
              What good reports include
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[#47624b]">
              <p>Show the hazard clearly from a safe angle.</p>
              <p>Name the exact location or landmark nearby.</p>
              <p>Describe what makes it dangerous or difficult to repair.</p>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
