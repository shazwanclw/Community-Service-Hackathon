"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartColumnBig,
  CirclePlus,
  ClipboardList,
  House,
  ShieldCheck,
  TriangleAlert,
  User,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";

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

export const appLinks = [
  { href: "/", label: "Home", icon: House },
  { href: "/report", label: "Report", icon: CirclePlus },
  { href: "/issues", label: "Issues", icon: TriangleAlert },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/leaderboard", label: "Leaderboard", icon: ChartColumnBig },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const links = [...appLinks];

  if (isAdmin) {
    links.push({ href: "/admin", label: "Moderation", icon: ShieldCheck });
  }

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-20 border-t border-[#cdb39d] bg-[#f8f4ea] lg:hidden"
    >
      <div className="flex gap-2 overflow-x-auto px-3 py-2.5">
        {links.map(({ href, icon: Icon, label }) => {
          const active = isLinkActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-[88px] flex-col items-center gap-1 rounded-[18px] px-3 py-2 text-[11px] font-semibold transition ${
                active
                  ? "bg-[#8e0d0d] text-[#fff8f4]"
                  : "text-[#7b1917] hover:bg-white/70"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
