"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect } from "react";

type IssuePreviewModalProps = {
  afterPhotoUrl?: string | null;
  beforePhotoUrl: string;
  description: string;
  onClose: () => void;
  pointValue: number;
  reporterName?: string | null;
  statusLabel?: string;
  title?: string;
};

export function IssuePreviewModal({
  afterPhotoUrl,
  beforePhotoUrl,
  description,
  onClose,
  pointValue,
  reporterName,
  statusLabel,
  title = "Issue preview",
}: IssuePreviewModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3f1717]/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[24px] border border-[#dcc9b9] bg-[#fffaf3] shadow-[0_32px_80px_rgba(77,28,25,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e8dcc9] px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8d6d63]">
              {title}
            </p>
            <h2 className="mt-2 font-display text-3xl text-[#8e0d0d]">
              {statusLabel ?? "Open task"}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#6d5752]">
              <span className="rounded-full bg-[#fff1ea] px-3 py-1 font-bold text-[#8e0d0d]">
                {pointValue} pts
              </span>
              {reporterName ? (
                <span className="rounded-full border border-[#d8d0c3] px-3 py-1">
                  {reporterName}
                </span>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d8d0c3] bg-white text-[#8e0d0d]"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className={`grid gap-4 ${afterPhotoUrl ? "md:grid-cols-2" : ""}`}>
            <section>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8d6d63]">
                Before
              </p>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[#e9e0d2]">
                <Image
                  src={beforePhotoUrl}
                  alt="Issue before photo"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1279px) 100vw, 45vw"
                />
              </div>
            </section>

            {afterPhotoUrl ? (
              <section>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8d6d63]">
                  After
                </p>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[#e9e0d2]">
                  <Image
                    src={afterPhotoUrl}
                    alt="Issue after photo"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1279px) 100vw, 45vw"
                  />
                </div>
              </section>
            ) : null}
          </div>

          <section className="rounded-[20px] border border-[#e8dcc9] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8d6d63]">
              Full description
            </p>
            <p className="mt-4 text-base leading-8 text-[#5d4844]">{description}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
