"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardPlus,
  ListTodo,
  LayoutList,
  Medal,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";

export const appLinks = [
  { href: "/", label: "Home", icon: LayoutList },
  { href: "/report", label: "Report", icon: ClipboardPlus },
  { href: "/issues", label: "Issues", icon: ShieldCheck },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/leaderboard", label: "Leaderboard", icon: Medal },
  { href: "/profile", label: "Profile", icon: UserRound },
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
      className="sticky bottom-0 z-20 border-t border-white/60 bg-[rgba(247,241,231,0.95)] backdrop-blur lg:hidden"
    >
      <div className="flex gap-2 overflow-x-auto px-3 py-2">
        {links.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href || (href !== "/" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-[88px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                active
                  ? "bg-[#123524] text-[#f7f1e7]"
                  : "text-[#47624b] hover:bg-white/70"
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
