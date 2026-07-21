"use client";

import Image from "next/image";
import Link from "next/link";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Camera, LoaderCircle, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { db, storage } from "@/lib/firebase";
import { getIssueView } from "@/lib/issue-lifecycle";
import { getDisplayInitials, getDisplayName } from "@/lib/profile-display";
import { IssueRecord } from "@/lib/types";
import { useLiveNow } from "@/lib/use-live-now";

export default function ProfilePage() {
  const { loading, profile, user } = useAuth();
  const [reportedIssues, setReportedIssues] = useState<IssueRecord[]>([]);
  const [assignedIssues, setAssignedIssues] = useState<IssueRecord[]>([]);
  const [fullNameDraft, setFullNameDraft] = useState<string | null>(null);
  const [usernameDraft, setUsernameDraft] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const nowMs = useLiveNow();

  const fullName = fullNameDraft ?? profile?.full_name ?? user?.displayName ?? "";
  const username = usernameDraft ?? profile?.username ?? "";

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribeReported = onSnapshot(
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

    const unsubscribeAssigned = onSnapshot(
      query(collection(db, "issues"), where("fixer_id", "==", user.uid)),
      (snapshot) => {
        setAssignedIssues(
          snapshot.docs.map((docSnapshot) => ({
            id: docSnapshot.id,
            ...(docSnapshot.data() as Omit<IssueRecord, "id">),
          })),
        );
      },
    );

    return () => {
      unsubscribeReported();
      unsubscribeAssigned();
    };
  }, [user]);

  const activeTasks = useMemo(
    () =>
      assignedIssues.filter(
        (issue) => getIssueView(issue, nowMs, user?.uid).phase === "claimed",
      ).length,
    [assignedIssues, nowMs, user?.uid],
  );
  const reviewTasks = useMemo(
    () =>
      assignedIssues.filter(
        (issue) => getIssueView(issue, nowMs, user?.uid).phase === "pending_review",
      ).length,
    [assignedIssues, nowMs, user?.uid],
  );
  const completedTasks = useMemo(
    () =>
      assignedIssues.filter(
        (issue) => getIssueView(issue, nowMs, user?.uid).phase === "resolved",
      ).length,
    [assignedIssues, nowMs, user?.uid],
  );

  async function handleSaveProfile() {
    if (!user) {
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      let profilePhotoUrl = profile?.profile_photo_url ?? null;

      if (photoFile) {
        const extension = photoFile.name.split(".").pop() ?? "jpg";
        const storageRef = ref(
          storage,
          `users/profile/${user.uid}-${Date.now()}.${extension}`,
        );

        await uploadBytes(storageRef, photoFile, {
          contentType: photoFile.type,
        });

        profilePhotoUrl = await getDownloadURL(storageRef);
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email ?? profile?.email ?? "",
          full_name: fullName.trim(),
          profile_photo_url: profilePhotoUrl,
          total_points: profile?.total_points ?? 0,
          username: username.trim() || null,
        },
        { merge: true },
      );

      const nextReporterName = fullName.trim() || user.displayName || user.email || "Community member";
      const nextReporterUsername = username.trim() || null;
      const issueSnapshot = await getDocs(
        query(collection(db, "issues"), where("reporter_id", "==", user.uid)),
      );
      const batch = writeBatch(db);

      issueSnapshot.forEach((issueDoc) => {
        batch.update(issueDoc.ref, {
          reporter_name: nextReporterName,
          reporter_profile_photo_url: profilePhotoUrl,
          reporter_username: nextReporterUsername,
        });
      });

      if (!issueSnapshot.empty) {
        await batch.commit();
      }

      setPhotoFile(null);
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
        setPhotoPreviewUrl(null);
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  const profilePhotoUrl = photoPreviewUrl || profile?.profile_photo_url || null;
  const displayName = getDisplayName({
    email: user?.email,
    fullName: fullName || profile?.full_name,
    username: username || profile?.username,
  });
  const initials = getDisplayInitials({
    email: user?.email,
    fullName: fullName || profile?.full_name,
    username: username || profile?.username,
  });

  return (
    <AppShell
      title="Profile"
      subtitle="Manage your account."
    >
      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#8e0d0d]" />
        </div>
      ) : !user ? (
        <div className="mx-5 mt-5 rounded-[24px] border border-dashed border-[#d1b7a4] bg-white/70 px-5 py-10 text-center md:mx-8">
          <p className="font-display text-3xl text-[#8e0d0d]">Sign in first</p>
          <p className="mt-3 text-sm leading-6 text-[#6d5752]">
            Your profile becomes available after you log in.
          </p>
          <Link
            href="/auth"
            className="mt-5 inline-flex rounded-full bg-[#8e0d0d] px-4 py-3 text-sm font-semibold text-white"
          >
            Go to auth
          </Link>
        </div>
      ) : (
        <div className="space-y-6 px-5 py-5 md:px-8">
          <section className="rounded-[22px] border border-[#dfcec0] bg-white p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ead8d0] text-2xl font-bold text-[#7a1a17]">
                  {profilePhotoUrl ? (
                    <Image
                      src={profilePhotoUrl}
                      alt={displayName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#321817]">{displayName}</h2>
                  <p className="mt-1 text-sm text-[#7c6761]">{user.email}</p>
                  <p className="mt-2 text-sm text-[#7c6761]">
                    {profile?.username?.trim() ? `@${profile.username}` : "No username set"}
                  </p>
                </div>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d8c4b2] bg-[#fffaf3] px-4 py-2 text-sm font-semibold text-[#8e0d0d]">
                <Camera className="h-4 w-4" />
                Change photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null;
                    if (photoPreviewUrl) {
                      URL.revokeObjectURL(photoPreviewUrl);
                    }
                    setPhotoFile(nextFile);
                    setPhotoPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
                  }}
                  className="sr-only"
                />
              </label>
            </div>
          </section>

          <section className="rounded-[22px] border border-[#dfcec0] bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-[#321817]">Personal information</h3>
              <button
                type="button"
                onClick={() => void handleSaveProfile()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#8e0d0d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#8d6d63]">Full name</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullNameDraft(event.target.value)}
                  className="w-full rounded-[14px] border border-[#d8c4b2] bg-[#fffdf8] px-4 py-3 text-sm text-[#321817]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#8d6d63]">Username</span>
                <input
                  value={username}
                  onChange={(event) => setUsernameDraft(event.target.value.replace(/^@+/, ""))}
                  placeholder="your.username"
                  className="w-full rounded-[14px] border border-[#d8c4b2] bg-[#fffdf8] px-4 py-3 text-sm text-[#321817]"
                />
              </label>
              <div className="block">
                <span className="mb-2 block text-sm font-semibold text-[#8d6d63]">Email</span>
                <div className="rounded-[14px] border border-[#eadbcc] bg-[#fbf7ef] px-4 py-3 text-sm text-[#5d4844]">
                  {user.email}
                </div>
              </div>
            </div>

            {saveError ? (
              <div className="mt-4 rounded-[18px] border border-[#f0b7b7] bg-[#fff1f1] px-4 py-3 text-sm text-[#a63f3f]">
                {saveError}
              </div>
            ) : null}
          </section>

          <section className="rounded-[22px] border border-[#dfcec0] bg-white p-6">
            <h3 className="text-lg font-semibold text-[#321817]">Activity summary</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { label: "Total points", value: profile?.total_points ?? 0 },
                { label: "Reports posted", value: reportedIssues.length },
                { label: "Active tasks", value: activeTasks },
                { label: "Waiting review", value: reviewTasks },
                { label: "Completed", value: completedTasks },
              ].map((item) => (
                <div key={item.label} className="rounded-[18px] bg-[#fbf6ef] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#8d6d63]">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold text-[#8e0d0d]">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[22px] border border-[#dfcec0] bg-white p-6">
            <h3 className="text-lg font-semibold text-[#321817]">Recent reports</h3>
            <div className="mt-4 space-y-3">
              {reportedIssues.slice(0, 5).map((issue) => (
                <div key={issue.id} className="rounded-[18px] bg-[#fffaf3] px-4 py-3">
                  <p className="text-sm font-semibold text-[#321817]">{issue.description}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8d6d63]">
                    {issue.status} - {issue.point_value} pts
                  </p>
                </div>
              ))}
              {!reportedIssues.length ? (
                <p className="text-sm leading-6 text-[#6d5752]">
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
