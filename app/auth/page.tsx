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
          total_points: 0,
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
    <div className="min-h-screen px-4 py-5 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1240px]">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#47624b]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        <div className="grid overflow-hidden rounded-[34px] border border-white/70 bg-[rgba(255,250,241,0.9)] shadow-[0_24px_80px_rgba(18,53,36,0.12)] lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
          <section className="hidden bg-[#123524] p-8 text-[#f7f1e7] lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d2e1d7]">
              Desa Mentari access
            </p>
            <h1 className="mt-4 font-display text-6xl leading-none">
              Clean streets need a shared dashboard.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-[#d9e7de]">
              Sign in to report hazards, claim fixes, and build a verified
              reward history across the neighborhood network.
            </p>
          </section>

          <section className="p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#47624b] lg:hidden">
              Desa Mentari access
            </p>
            <h1 className="mt-3 font-display text-4xl leading-none text-[#123524]">
              {mode === "login" ? "Welcome back" : "Join the cleanup crew"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#47624b]">
              Log in to report hazards, submit repairs, and track your points.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-[#ebe1d1] p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  mode === "login" ? "bg-white text-[#123524]" : "text-[#6d7f71]"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  mode === "signup" ? "bg-white text-[#123524]" : "text-[#6d7f71]"
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
                  <span className="mb-2 block text-sm font-semibold text-[#123524]">
                    Full name
                  </span>
                  <input
                    name="fullName"
                    type="text"
                    required
                    className="w-full rounded-3xl border border-[#d8d0c3] bg-white px-4 py-3 text-sm text-[#123524]"
                    placeholder="Aina Rahman"
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#123524]">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-3xl border border-[#d8d0c3] bg-white px-4 py-3 text-sm text-[#123524]"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#123524]">
                  Password
                </span>
                <input
                  name="password"
                  type="password"
                  minLength={6}
                  required
                  className="w-full rounded-3xl border border-[#d8d0c3] bg-white px-4 py-3 text-sm text-[#123524]"
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#123524] px-4 py-3 text-sm font-semibold text-[#f7f1e7] disabled:opacity-70"
              >
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {mode === "login" ? "Log In" : "Create Account"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
