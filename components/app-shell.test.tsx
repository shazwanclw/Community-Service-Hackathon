import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";

const pathnameState = {
  value: "/",
};

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameState.value,
}));

vi.mock("@/components/auth-provider", () => ({
  useAuth: vi.fn(() => ({
    isAdmin: false,
    loading: false,
    profile: { full_name: "Aina Rahman", total_points: 42 },
    signOutUser: vi.fn(),
    user: { email: "aina@example.com" },
  })),
}));

describe("AppShell", () => {
  beforeEach(() => {
    pathnameState.value = "/";
    vi.mocked(useAuth).mockReturnValue({
      isAdmin: false,
      loading: false,
      profile: { full_name: "Aina Rahman", total_points: 42 },
      signOutUser: vi.fn(),
      user: { email: "aina@example.com" },
    });
  });

  it("renders the SnapFix shell with brand, sidebar navigation, and board header", () => {
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
    expect(screen.getAllByText("SnapFix").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Report").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Report Board" })).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("min-h-screen", "w-full");
    expect(container.firstElementChild).not.toHaveClass("py-2", "pr-2");
    expect(screen.getByRole("complementary", { name: /primary/i })).toHaveClass("lg:w-[256px]");
    expect(screen.getByRole("main").parentElement).toHaveClass("lg:overflow-y-auto");
    expect(screen.getByRole("heading", { name: "Report Board" })).toHaveClass(
      "text-[26px]",
      "md:text-[38px]",
    );
    expect(
      screen.getByText("Submit a report and help keep the neighborhood clean."),
    ).toHaveClass("text-[13px]", "leading-5");
    expect(
      screen
        .getByRole("heading", { name: "Report Board" })
        .parentElement?.parentElement?.parentElement?.parentElement,
    ).toHaveClass("pb-5", "pt-4");
    expect(screen.getByRole("banner")).not.toHaveClass("overflow-hidden");
  });

  it("shows a locked state on non-home routes when signed out", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAdmin: false,
      loading: false,
      profile: null,
      signOutUser: vi.fn(),
      user: null,
    });
    pathnameState.value = "/tasks";

    render(
      <AppShell title="Tasks Board" subtitle="Track your work.">
        <div>Body content</div>
      </AppShell>,
    );

    expect(screen.getByText("Sign in first")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to auth/i })).toHaveAttribute("href", "/auth");
    expect(screen.queryByText("Body content")).not.toBeInTheDocument();
  });

  it("keeps the home route open when signed out", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAdmin: false,
      loading: false,
      profile: null,
      signOutUser: vi.fn(),
      user: null,
    });
    pathnameState.value = "/";

    render(
      <AppShell title="Home" subtitle="Welcome.">
        <div>Body content</div>
      </AppShell>,
    );

    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(screen.queryByText("Sign in first")).not.toBeInTheDocument();
  });

  it("uses a hamburger-triggered mobile menu for links, points, and sign out", () => {
    render(
      <AppShell title="Issues Board" subtitle="Browse issues.">
        <div>Body content</div>
      </AppShell>,
    );

    expect(screen.getByRole("button", { name: /open navigation menu/i })).toBeInTheDocument();
    expect(screen.queryByText("Active account")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open navigation menu/i }));

    expect(screen.getAllByText("42").length).toBeGreaterThan(1);
    expect(screen.getAllByRole("button", { name: /sign out/i }).length).toBeGreaterThan(1);
    expect(screen.getAllByRole("link", { name: /tasks/i }).length).toBeGreaterThan(1);
  });
});
