import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IssueCard } from "@/components/issue-card";
import { IssueRecord } from "@/lib/types";

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
  }: {
    alt?: string;
    src?: string;
  }) => <img alt={alt} src={src} />,
}));

vi.mock("@/lib/use-live-now", () => ({
  useLiveNow: () => new Date("2026-07-16T08:00:00.000Z").getTime(),
}));

function createIssue(overrides: Partial<IssueRecord> = {}): IssueRecord {
  return {
    id: "issue-1",
    reporter_id: "reporter-1",
    status: "open",
    description: "Overflowing trash near the playground",
    location: "Playground entrance",
    before_photo_url: "https://example.com/before.jpg",
    point_value: 12,
    created_at: null,
    comments: [
      {
        id: "comment-1",
        text: "I saw this too.",
        user_id: "user-1",
        user_name: "Aina",
        created_at_iso: "2026-07-16T07:00:00.000Z",
      },
    ],
    ...overrides,
  };
}

describe("IssueCard", () => {
  it("caps the visible width of the comments area", () => {
    render(<IssueCard issue={createIssue()} />);

    fireEvent.click(screen.getByRole("button", { name: /1/i }));

    expect(screen.getByText("I saw this too.").parentElement?.parentElement).toHaveClass(
      "max-w-3xl",
    );
    expect(screen.getByPlaceholderText("Add a comment...").closest("form")).toHaveClass(
      "max-w-3xl",
    );
  });
});
