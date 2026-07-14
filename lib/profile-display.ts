import { IssueRecord } from "@/lib/types";

type DisplayIdentity = {
  email?: string | null;
  fullName?: string | null;
  username?: string | null;
};

export function getDisplayName(identity: DisplayIdentity) {
  const username = identity.username?.trim();
  if (username) {
    return username;
  }

  const fullName = identity.fullName?.trim();
  if (fullName) {
    return fullName;
  }

  const emailLocal = identity.email?.split("@")[0]?.trim();
  return emailLocal || "Community member";
}

export function getDisplayInitials(identity: DisplayIdentity) {
  const displayName = getDisplayName(identity);
  const parts = displayName
    .replace(/[^a-zA-Z0-9.\s_-]/g, " ")
    .split(/[\s._-]+/)
    .filter(Boolean);

  if (!parts.length) {
    return "CM";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function getIssueBeforePhotoUrls(
  issue: Pick<IssueRecord, "before_photo_url" | "before_photo_urls">,
) {
  const urls = issue.before_photo_urls?.filter(Boolean) ?? [];

  if (urls.length) {
    return urls;
  }

  return issue.before_photo_url ? [issue.before_photo_url] : [];
}

export function getIssueGalleryMode(imageUrls: string[]) {
  if (!imageUrls.length) {
    return "empty" as const;
  }

  if (imageUrls.length === 1) {
    return "single" as const;
  }

  if (imageUrls.length === 2) {
    return "double" as const;
  }

  return "scroll" as const;
}
