"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardPlus,
  LayoutList,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";

export const appLinks = [
  { href: "/", label: "Feed", icon: LayoutList },
  { href: "/report", label: "Report", icon: ClipboardPlus },
  { href: "/profile", label: "Wallet", icon: WalletCards },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const links = appLinks.filter((link) => link.href !== "/admin" || isAdmin);

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-20 border-t border-white/60 bg-[rgba(247,241,231,0.95)] backdrop-blur lg:hidden"
    >
      <div
        className={`grid gap-1 px-3 py-2 ${
          links.length === 4 ? "grid-cols-4" : "grid-cols-3"
        }`}
      >
        {links.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href || (href !== "/" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold transition ${
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
