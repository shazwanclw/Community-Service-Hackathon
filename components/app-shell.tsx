"use client";

import Link from "next/link";
import { LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

import { appLinks } from "@/components/bottom-nav";
import { useAuth } from "@/components/auth-provider";
import { usePathname } from "next/navigation";

function isFixTaskRoute(pathname: string) {
  return /^\/issues\/[^/]+\/fix$/.test(pathname);
}

function isLinkActive(pathname: string, href: string) {
  if (href === "/tasks" && isFixTaskRoute(pathname)) {
    return true;
  }

  if (href === "/issues" && isFixTaskRoute(pathname)) {
    return false;
  }

  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

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
  const requiresAuth = pathname !== "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isAdmin) {
    links.push({ href: "/admin", label: "Moderation", icon: ShieldCheck });
  }

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen w-full bg-[#f2f0f3]">
      <div className="flex min-h-screen w-full overflow-hidden bg-[#f8f4ea] shadow-[0_18px_48px_rgba(77,28,25,0.08)] lg:h-screen lg:max-h-screen lg:border lg:border-[#cdb39d]">
        <aside
          aria-label="Primary"
          className="hidden min-h-full shrink-0 flex-col justify-between border-r border-[#bda28a] bg-[#fbf8ef] lg:flex lg:h-screen lg:w-[256px]"
        >
          <div className="p-4">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-[#9d2b23] bg-white px-3 py-2 text-[14px] font-bold text-[#8f100d]"
            >
              SnapFix
            </Link>

            <nav aria-label="Primary" className="mt-11 space-y-2">
              {links.map(({ href, icon: Icon, label }) => {
                const active = isLinkActive(pathname, href);

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
            <div className="relative px-4 pb-5 pt-4 sm:px-5 md:px-8 md:pb-6 md:pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <button
                    type="button"
                    aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={mobileMenuOpen}
                    onClick={() => setMobileMenuOpen((current) => !current)}
                    className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/12 text-white backdrop-blur lg:hidden"
                  >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </button>

                  <div className="min-w-0">
                    <h1 className="font-display text-[26px] leading-none text-white sm:text-[32px] md:text-[38px]">
                      {title}
                    </h1>
                    <p className="mt-2 max-w-2xl text-[13px] font-semibold leading-5 text-[#fff4f3] sm:text-[14px] md:text-[15px]">
                      {subtitle}
                    </p>
                  </div>
                </div>

                {actions ? <div className="w-full sm:w-auto">{actions}</div> : null}
              </div>
            </div>
          </header>

          {mobileMenuOpen ? (
            <div className="fixed inset-0 z-30 bg-[#2e1615]/45 backdrop-blur-[2px] lg:hidden">
              <div
                className="absolute inset-0"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="absolute left-0 top-0 z-10 flex h-full w-[min(82vw,320px)] flex-col border-r border-[#d8c4b2] bg-[#fffaf3] shadow-[18px_0_48px_rgba(77,28,25,0.18)]">
                <div className="border-b border-[#eadbcc] px-4 pb-4 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8d6d63]">
                        Navigation
                      </p>
                      <p className="mt-1.5 font-display text-2xl text-[#8e0d0d]">Menu</p>
                    </div>
                    <button
                      type="button"
                      aria-label="Close navigation menu"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8c4b2] bg-white text-[#7b1917]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <nav aria-label="Mobile primary" className="flex-1 overflow-y-auto px-3 py-3">
                  <div className="space-y-2">
                    {links.map(({ href, icon: Icon, label }) => {
                      const active = isLinkActive(pathname, href);

                      return (
                        <Link
                          key={href}
                          href={href}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between rounded-[16px] px-3 py-2.5 text-[13px] font-semibold transition ${
                            active
                              ? "bg-[#8e0d0d] text-white"
                              : "border border-[#eadbcc] bg-white text-[#6b2926]"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            {label}
                          </span>
                          {active ? <span className="text-[9px] uppercase tracking-[0.16em]">Open</span> : null}
                        </Link>
                      );
                    })}
                  </div>
                </nav>

                <div className="border-t border-[#eadbcc] px-3 py-3">
                  <div className="rounded-[18px] border border-[#d8c4b2] bg-white px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d6d63]">
                      Points
                    </p>
                    <p className="mt-1.5 font-display text-3xl leading-none text-[#8e0d0d]">
                      {profile?.total_points ?? 0}
                    </p>
                  </div>

                  {user ? (
                    <button
                      type="button"
                      onClick={() => void signOutUser()}
                      className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#8e0d0d] px-3 py-2.5 text-[13px] font-semibold text-white"
                      aria-label="Sign out"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <main className="relative z-0 flex-1 bg-white px-0 py-0">
            {!user && requiresAuth ? (
              <div className="mx-5 mt-5 rounded-[24px] border border-dashed border-[#d1b7a4] bg-white/70 px-5 py-10 text-center md:mx-8">
                <p className="font-display text-3xl text-[#8e0d0d]">Sign in first</p>
                <p className="mt-3 text-sm leading-6 text-[#6d5752]">
                  This area is locked until you log in or create an account.
                </p>
                <Link
                  href="/auth"
                  className="mt-5 inline-flex rounded-full bg-[#8e0d0d] px-4 py-3 text-sm font-semibold text-white"
                >
                  Go to auth
                </Link>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
