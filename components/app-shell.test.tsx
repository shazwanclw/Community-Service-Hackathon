import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/app-shell";

const pathnameState = {
  value: "/",
};

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameState.value,
}));

vi.mock("@/components/auth-provider", () => ({
  useAuth: () => ({
    profile: { full_name: "Aina Rahman", total_points: 42 },
    signOutUser: vi.fn(),
    user: { email: "aina@example.com" },
  }),
}));

describe("AppShell", () => {
  beforeEach(() => {
    pathnameState.value = "/";
  });

  it("renders the mymentari board shell with brand, sidebar navigation, and board header", () => {
    render(
      <AppShell
        title="Report Board"
        subtitle="Submit a report and help keep the neighborhood clean."
      >
        <div>Body content</div>
      </AppShell>,
    );

    expect(
      screen.getByRole("complementary", { name: /primary/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("navigation", { name: /primary/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByRole("main")).toHaveTextContent("Body content");
    expect(screen.getAllByText("MyMentari").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Report").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Report Board" })).toBeInTheDocument();
  });
});
