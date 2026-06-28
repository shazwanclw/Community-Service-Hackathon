"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Wrench } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { IssueRecord } from "@/lib/types";

function statusCopy(status: IssueRecord["status"]) {
  if (status === "pending") {
    return {
      label: "Pending Review",
      tone: "bg-[#f4a261]/15 text-[#b25a12]",
    };
  }

  if (status === "approved") {
    return {
      label: "Approved",
      tone: "bg-[#66ad85]/15 text-[#1f6a3d]",
    };
  }

  return {
    label: "Open",
    tone: "bg-[#123524] text-[#f7f1e7]",
  };
}

export function IssueCard({
  issue,
  showFixAction = false,
}: {
  issue: IssueRecord;
  showFixAction?: boolean;
}) {
  const { user } = useAuth();
  const badge = statusCopy(issue.status);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[30px] border border-[#d8d0c3] bg-white shadow-[0_18px_40px_rgba(18,53,36,0.08)]">
      <div className="relative aspect-[16/10] bg-[#e9e0d2]">
        <Image
          src={issue.before_photo_url}
          alt={issue.description}
          fill
          className="object-cover"
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        />
      </div>

      <div className="flex flex-1 flex-col space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge.tone}`}>
            {badge.label}
          </span>
          <span className="rounded-full bg-[#f4a261]/18 px-3 py-1 text-sm font-bold text-[#8f4b11]">
            {issue.point_value} pts
          </span>
        </div>

        <p className="text-sm leading-6 text-[#2c4633]">{issue.description}</p>

        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#6d7f71]">
          <Clock3 className="h-4 w-4" />
          Community submitted task
        </div>

        {showFixAction && issue.status === "open" ? (
          <Link
            href={user ? `/issues/${issue.id}/fix` : "/auth"}
            className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#123524] px-4 py-3 text-sm font-semibold text-[#f7f1e7] transition hover:bg-[#1a4a32]"
          >
            <Wrench className="h-4 w-4" />
            {user ? "Claim & Fix" : "Log In To Fix"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
