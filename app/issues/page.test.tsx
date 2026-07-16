import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import IssuesPage from "@/app/issues/page";

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
  }: {
    alt?: string;
    src?: string;
  }) => <img alt={alt} src={src} />,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/components/app-shell", () => ({
  AppShell: ({
    actions,
    children,
    title,
  }: {
    actions?: React.ReactNode;
    children: React.ReactNode;
    title: string;
  }) => (
    <div>
      <h1>{title}</h1>
      <div>{actions}</div>
      <main>{children}</main>
    </div>
  ),
}));

vi.mock("@/components/issue-preview-modal", () => ({
  IssuePreviewModal: () => null,
}));

vi.mock("@/components/auth-provider", () => ({
  useAuth: () => ({
    user: { uid: "viewer-1" },
  }),
}));

vi.mock("@/lib/client-api", () => ({
  postAuthedJson: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("@/lib/use-live-now", () => ({
  useLiveNow: () => new Date("2026-07-16T08:00:00.000Z").getTime(),
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => "issues-collection"),
  onSnapshot: vi.fn((_collection, onNext) => {
    onNext({
      docs: [
        {
          id: "issue-1",
          data: () => ({
            reporter_id: "reporter-1",
            reporter_name: "Aina",
            status: "open",
            description: "Overflowing bin",
            before_photo_url: "https://example.com/bin.jpg",
            point_value: 12,
            comments: [],
            liked_by: [],
          }),
        },
      ],
    });

    return vi.fn();
  }),
}));

describe("IssuesPage", () => {
  it("renders status subtabs and keeps the filter menu sort-only", async () => {
    render(<IssuesPage />);

    await waitFor(() => {
      expect(screen.getByText("Overflowing bin")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /active claim/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /waiting review/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /completed/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /filter/i }));

    expect(screen.getByRole("button", { name: /newest first/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /highest points/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /all issues/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /active and open/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /resolved/i }),
    ).not.toBeInTheDocument();
  });
});
