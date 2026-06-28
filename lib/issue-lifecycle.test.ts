import { describe, expect, it } from "vitest";

import {
  getIssueView,
  isIssueClaimActive,
  ISSUE_CLAIM_WINDOW_MS,
} from "@/lib/issue-lifecycle";
import { IssueRecord } from "@/lib/types";

const NOW = new Date("2026-06-28T12:00:00.000Z").getTime();

function createIssue(overrides: Partial<IssueRecord> = {}): IssueRecord {
  return {
    id: "issue-1",
    reporter_id: "reporter-1",
    status: "open",
    description: "Broken drain cover beside the court",
    before_photo_url: "https://example.com/before.jpg",
    point_value: 55,
    created_at: null,
    ...overrides,
  };
}

describe("issue lifecycle", () => {
  it("treats unclaimed open issues as available", () => {
    const issue = createIssue();

    expect(isIssueClaimActive(issue, NOW)).toBe(false);
    expect(getIssueView(issue, NOW)).toMatchObject({
      canClaim: true,
      phase: "available",
      statusLabel: "Open Task",
    });
  });

  it("treats active claims as unavailable to other users", () => {
    const issue = createIssue({
      fixer_id: "fixer-1",
      claim_expires_at_ms: NOW + ISSUE_CLAIM_WINDOW_MS,
    });

    expect(isIssueClaimActive(issue, NOW)).toBe(true);
    expect(getIssueView(issue, NOW, "other-user")).toMatchObject({
      canClaim: false,
      isOwnedByViewer: false,
      phase: "claimed",
      statusLabel: "Claimed",
    });
  });

  it("keeps an active claim actionable for the assigned fixer", () => {
    const issue = createIssue({
      fixer_id: "fixer-1",
      claim_expires_at_ms: NOW + ISSUE_CLAIM_WINDOW_MS,
    });

    expect(getIssueView(issue, NOW, "fixer-1")).toMatchObject({
      canClaim: false,
      canSubmitProof: true,
      isOwnedByViewer: true,
      phase: "claimed",
    });
  });

  it("reopens an expired claim for the next volunteer", () => {
    const issue = createIssue({
      fixer_id: "fixer-1",
      claim_expires_at_ms: NOW - 1,
    });

    expect(isIssueClaimActive(issue, NOW)).toBe(false);
    expect(getIssueView(issue, NOW, "other-user")).toMatchObject({
      canClaim: true,
      phase: "available",
      statusLabel: "Open Again",
    });
  });

  it("treats pending issues as waiting for review", () => {
    const issue = createIssue({
      status: "pending",
      fixer_id: "fixer-1",
      after_photo_url: "https://example.com/after.jpg",
    });

    expect(getIssueView(issue, NOW, "fixer-1")).toMatchObject({
      canClaim: false,
      canSubmitProof: false,
      phase: "pending_review",
      statusLabel: "Pending Review",
    });
  });

  it("treats approved issues as resolved", () => {
    const issue = createIssue({
      status: "approved",
      fixer_id: "fixer-1",
      after_photo_url: "https://example.com/after.jpg",
    });

    expect(getIssueView(issue, NOW)).toMatchObject({
      canClaim: false,
      phase: "resolved",
      statusLabel: "Resolved",
    });
  });
});
