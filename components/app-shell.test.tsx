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
    const { container } = render(
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
    expect(screen.getAllByText("CleanMerit").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Report").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Report Board" })).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("min-h-screen", "w-full");
    expect(container.firstElementChild).not.toHaveClass("py-2", "pr-2");
    expect(screen.getByRole("complementary", { name: /primary/i })).toHaveClass("lg:w-[256px]");
    expect(screen.getByRole("main").parentElement).toHaveClass("lg:overflow-y-auto");
    expect(screen.getByRole("heading", { name: "Report Board" })).toHaveClass(
      "text-[32px]",
      "md:text-[38px]",
    );
    expect(
      screen.getByText("Submit a report and help keep the neighborhood clean."),
    ).toHaveClass("text-[14px]", "leading-5");
    expect(
      screen.getByRole("heading", { name: "Report Board" }).parentElement?.parentElement,
    ).toHaveClass("pb-4", "pt-5");
    expect(screen.getByRole("banner")).not.toHaveClass("overflow-hidden");
  });
});
