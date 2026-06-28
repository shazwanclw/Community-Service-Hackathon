"use client";

import Link from "next/link";
import { LogOut, Sparkles } from "lucide-react";

import { BottomNav, appLinks } from "@/components/bottom-nav";
import { useAuth } from "@/components/auth-provider";
import { usePathname } from "next/navigation";

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  actions?: React.ReactNode;
  children: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  const { isAdmin, profile, signOutUser, user } = useAuth();
  const pathname = usePathname();
  const links = appLinks.filter((link) => link.href !== "/admin" || isAdmin);

  return (
    <div className="min-h-screen px-3 py-3 md:px-5 md:py-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1480px] overflow-hidden rounded-[34px] border border-white/70 bg-[rgba(247,241,231,0.85)] shadow-[0_30px_120px_rgba(18,53,36,0.12)] backdrop-blur">
        <aside
          aria-label="Primary"
          className="hidden w-[310px] shrink-0 flex-col justify-between border-r border-[#d8d0c3] bg-[linear-gradient(180deg,rgba(255,250,241,0.96)_0%,rgba(244,238,227,0.94)_100%)] p-6 lg:flex"
        >
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#cbbfaa] bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#47624b]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              CleanMerit
            </Link>

            <div className="mt-8 rounded-[28px] bg-[#123524] p-5 text-[#f7f1e7] shadow-[0_18px_50px_rgba(18,53,36,0.22)]">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#d2e1d7]">
                Community repair network
              </p>
              <p className="mt-3 font-display text-4xl leading-none">
                Laptop-ready field operations.
              </p>
              <p className="mt-3 text-sm leading-6 text-[#d9e7de]">
                Review live hazards, coordinate repairs, and track reward points
                in a full website workspace.
              </p>
            </div>

            <nav aria-label="Primary" className="mt-6 space-y-2">
              {links.map(({ href, icon: Icon, label }) => {
                const active =
                  pathname === href || (href !== "/" && pathname.startsWith(href));

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-[22px] px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-[#123524] text-[#f7f1e7] shadow-[0_14px_30px_rgba(18,53,36,0.18)]"
                        : "text-[#345341] hover:bg-white/80"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-[#d8d0c3] bg-white/85 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#6d7f71]">
                Active account
              </p>
              <p className="mt-2 text-base font-semibold text-[#123524]">
                {profile?.full_name ?? user?.email ?? "Community guest"}
              </p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#6d7f71]">
                    Points
                  </p>
                  <p className="mt-1 font-display text-4xl leading-none text-[#123524]">
                    {profile?.total_points ?? 0}
                  </p>
                </div>
                {user ? (
                  <button
                    type="button"
                    onClick={() => void signOutUser()}
                    className="inline-flex items-center gap-2 rounded-full border border-[#cfbea5] bg-[#fffaf1] px-4 py-2 text-sm font-semibold text-[#123524] transition hover:bg-white"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="relative overflow-hidden border-b border-[#d8d0c3] px-5 pb-5 pt-6 md:px-8 md:pb-6 md:pt-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(244,162,97,0.24),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(102,173,133,0.18),_transparent_32%)]" />
            <div className="relative flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 lg:hidden">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full border border-[#cbbfaa] bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#47624b]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    CleanMerit
                  </Link>
                  <div className="rounded-full border border-[#d4c6b0] bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#47624b]">
                    Community ops
                  </div>
                </div>

                <h1 className="mt-4 font-display text-4xl leading-none text-[#123524] md:text-5xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#47624b] md:text-[15px]">
                  {subtitle}
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
                {user ? (
                  <div className="rounded-[24px] border border-[#d8d0c3] bg-white/80 px-4 py-3 lg:hidden">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#6d7f71]">
                      Active account
                    </p>
                    <div className="mt-2 flex items-center gap-6">
                      <div>
                        <p className="text-sm font-semibold text-[#123524]">
                          {profile?.full_name ?? user.email}
                        </p>
                        <p className="text-xs text-[#6d7f71]">
                          {(profile?.total_points ?? 0).toString()} points
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void signOutUser()}
                        className="inline-flex items-center gap-2 rounded-full border border-[#cfbea5] bg-white/90 px-4 py-2 text-sm font-semibold text-[#123524]"
                        aria-label="Sign out"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : null}

                {actions ? <div className="w-full sm:w-auto">{actions}</div> : null}
              </div>
            </div>
          </header>

          <main className="flex-1 px-5 py-5 md:px-8 md:py-7">{children}</main>
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
