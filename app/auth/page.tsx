"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { FormEvent, useState } from "react";

import { auth, db } from "@/lib/firebase";

type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      if (mode === "signup") {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );

        await updateProfile(credential.user, {
          displayName: fullName,
        });

        await setDoc(doc(db, "users", credential.user.uid), {
          email,
          full_name: fullName,
          profile_photo_url: null,
          total_points: 0,
          username: null,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      router.push("/");
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Authentication failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f0f3] px-4 py-8 md:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1180px] items-center justify-center gap-0 overflow-hidden border border-[#cdb39d] bg-[#f8f4ea] shadow-[0_18px_48px_rgba(77,28,25,0.08)]">
        <div className="hidden h-full min-h-[680px] w-[44%] flex-col justify-between border-r border-[#bda28a] bg-[#fbf8ef] p-6 lg:flex">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#9d2b23] bg-white px-3 py-2 text-[14px] font-bold text-[#8f100d]">
              MyMentari
            </div>
            <h1 className="mt-10 font-display text-5xl leading-none text-[#8e0d0d]">
              Community boards that look and feel connected.
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-[#6d5752]">
              Log in to submit reports, claim tasks, and track the improvements happening around the neighborhood.
            </p>
          </div>
        </div>

        <div className="w-full max-w-[520px] px-6 py-10">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7b1917]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to feed
          </Link>

          <div className="rounded-[24px] border border-[#d9c6b6] bg-[rgba(255,250,241,0.96)] p-6 md:p-8">
            <h1 className="font-display text-4xl leading-none text-[#8e0d0d]">
              {mode === "login" ? "Log In" : "Create Account"}
            </h1>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-[#efe5da] p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  mode === "login" ? "bg-white text-[#8e0d0d]" : "text-[#8d6d63]"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  mode === "signup" ? "bg-white text-[#8e0d0d]" : "text-[#8d6d63]"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form
              onSubmit={(event) => void handleSubmit(event)}
              className="mt-6 space-y-4"
            >
              {mode === "signup" ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#321817]">
                    Full name
                  </span>
                  <input
                    name="fullName"
                    type="text"
                    required
                    className="w-full rounded-3xl border border-[#d8c4b2] bg-white px-4 py-3 text-sm text-[#321817]"
                    placeholder="Aina Rahman"
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#321817]">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-3xl border border-[#d8c4b2] bg-white px-4 py-3 text-sm text-[#321817]"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#321817]">
                  Password
                </span>
                <input
                  name="password"
                  type="password"
                  minLength={6}
                  required
                  className="w-full rounded-3xl border border-[#d8c4b2] bg-white px-4 py-3 text-sm text-[#321817]"
                  placeholder="At least 6 characters"
                />
              </label>

              {error ? (
                <div className="rounded-3xl border border-[#f0b7b7] bg-[#fff1f1] px-4 py-3 text-sm text-[#a63f3f]">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#8e0d0d] px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
              >
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {mode === "login" ? "Log In" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
