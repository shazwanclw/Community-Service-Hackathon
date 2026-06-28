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

  it("renders a desktop-style navigation shell around page content", () => {
    render(
      <AppShell
        title="Mentari Feed"
        subtitle="Browse open hazards across the district."
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
    expect(screen.getByText("Mentari Feed")).toBeInTheDocument();
  });
});
