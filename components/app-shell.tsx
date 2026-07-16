"use client";

import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";

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
  const links = [...appLinks];

  if (isAdmin) {
    links.push({ href: "/admin", label: "Moderation", icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen w-full bg-[#f2f0f3]">
      <div className="flex min-h-screen w-full overflow-hidden border border-[#cdb39d] bg-[#f8f4ea] shadow-[0_18px_48px_rgba(77,28,25,0.08)] lg:h-screen lg:max-h-screen">
        <aside
          aria-label="Primary"
          className="hidden min-h-full shrink-0 flex-col justify-between border-r border-[#bda28a] bg-[#fbf8ef] lg:flex lg:h-screen lg:w-[256px]"
        >
          <div className="p-4">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-[#9d2b23] bg-white px-3 py-2 text-[14px] font-bold text-[#8f100d]"
            >
              CleanMerit
            </Link>

            <nav aria-label="Primary" className="mt-11 space-y-2">
              {links.map(({ href, icon: Icon, label }) => {
                const active =
                  pathname === href || (href !== "/" && pathname.startsWith(href));

                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-full px-4 py-3 text-[15px] font-semibold transition ${
                      active
                        ? "bg-[#8e0d0d] text-[#fff8f4]"
                        : "text-[#7b1917] hover:bg-[#f5efe3]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        active ? "text-[#fff8f4]" : "text-[#7b1917]"
                      }`}
                    />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto border-t border-[#bda28a] p-4">
            <div className="rounded-[24px] border border-[#d8c4b2] bg-[#fffdf8] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8d6d63]">
                Points
              </p>
              <p className="mt-1 font-display text-3xl leading-none text-[#8e0d0d]">
                {profile?.total_points ?? 0}
              </p>
            </div>
            {user ? (
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="mt-3 ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d8c4b2] bg-[#fff7f1] text-[#7b1917]"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-white lg:h-screen lg:overflow-y-auto">
          <header className="relative z-20 overflow-visible border-b border-[#d8c4b2]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#8d0f10_0%,#cb5f5e_56%,#fff4f4_100%)]" />
            <div className="relative flex flex-wrap items-start justify-between gap-4 px-5 pb-4 pt-5 md:px-8 md:pb-5 md:pt-6">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 lg:hidden">
                  <Link
                    href="/"
                    className="inline-flex items-center rounded-full border border-[#9d2b23] bg-white px-3 py-2 text-[13px] font-bold text-[#8f100d]"
                  >
                    CleanMerit
                  </Link>
                </div>

                <h1 className="mt-3 font-display text-[32px] leading-none text-white md:text-[38px]">
                  {title}
                </h1>
                <p className="mt-2 max-w-2xl text-[14px] font-semibold leading-5 text-[#fff4f3] md:text-[15px]">
                  {subtitle}
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
                {user ? (
                  <div className="rounded-[18px] border border-white/25 bg-white/12 px-4 py-3 text-white backdrop-blur lg:hidden">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/80">
                      Active account
                    </p>
                    <div className="mt-2 flex items-center gap-6">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {profile?.full_name ?? user.email}
                        </p>
                        <p className="text-xs text-white/80">
                          {(profile?.total_points ?? 0).toString()} points
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void signOutUser()}
                        className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white px-4 py-2 text-sm font-semibold text-[#8e0d0d]"
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

          <main className="relative z-0 flex-1 bg-white px-0 py-0">{children}</main>
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
