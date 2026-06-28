# CleanMerit Desktop Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the mobile-framed CleanMerit prototype with a desktop-first responsive website shell while preserving the existing brand and route behavior.

**Architecture:** Refactor the shared shell first so every route inherits the new desktop structure, then update each page to take advantage of wider layouts. Keep mobile support by retaining a small-screen navigation fallback and responsive stacking rules instead of separate page implementations.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Firebase client SDK, Vitest, ESLint.

---

### Task 1: Baseline The Current Layout Constraints

**Files:**
- Inspect: `components/app-shell.tsx`
- Inspect: `components/bottom-nav.tsx`
- Inspect: `app/auth/page.tsx`
- Inspect: `app/globals.css`

**Step 1: Confirm the mobile-width constraints**

Run: `rg -n "max-w-md|BottomNav|sticky bottom-0" components app`
Expected: matches in the shell, mobile navigation, and auth layout

**Step 2: Record the routes that use the shared shell**

Run: `rg -n "<AppShell" app`
Expected: feed, report, profile, and admin routes use the shared shell

**Step 3: Commit the baseline notes**

```bash
git add docs/plans/2026-06-28-cleanmerit-desktop-redesign-design.md docs/plans/2026-06-28-cleanmerit-desktop-redesign.md
git commit -m "docs: add desktop redesign design and plan"
```

### Task 2: Add Layout Tests For The Shared Shell

**Files:**
- Create: `components/app-shell.test.tsx`
- Test: `components/app-shell.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/auth-provider", () => ({
  useAuth: () => ({
    profile: { full_name: "Test User", total_points: 42 },
    signOutUser: vi.fn(),
    user: { email: "user@example.com" },
  }),
}));

import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders desktop navigation and page content without a phone-width shell", () => {
    render(
      <AppShell title="Feed" subtitle="Desktop layout test">
        <div>Body content</div>
      </AppShell>,
    );

    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(screen.getByText("Feed")).toBeInTheDocument();
    expect(screen.getByText("CleanMerit")).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- components/app-shell.test.tsx`
Expected: FAIL because test tooling or desktop shell expectations are not yet satisfied

**Step 3: Add the minimum test dependencies or setup needed**

- If `@testing-library/react` is missing, add only the minimum required packages
- Keep the setup focused on rendering component output, not implementation internals

**Step 4: Run test to verify it passes**

Run: `npm run test -- components/app-shell.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add package.json package-lock.json vitest.setup.ts components/app-shell.test.tsx
git commit -m "test: cover desktop app shell rendering"
```

### Task 3: Refactor The Shared Shell For Desktop

**Files:**
- Modify: `components/app-shell.tsx`
- Modify: `components/bottom-nav.tsx`
- Modify: `app/globals.css`

**Step 1: Write the failing test for desktop shell structure**

- Extend `components/app-shell.test.tsx` to assert:
  - desktop navigation labels exist
  - content is rendered in a main region
  - mobile bottom nav remains present only as a fallback structure

**Step 2: Run test to verify it fails**

Run: `npm run test -- components/app-shell.test.tsx`
Expected: FAIL because the current shell is still a `max-w-md` mobile column

**Step 3: Write minimal implementation**

- Remove the global phone-width frame from `AppShell`
- Add a desktop sidebar and a main content column
- Move account summary into the sidebar or top header
- Keep `BottomNav` but hide it on desktop breakpoints
- Keep actions rendered in the page header area

**Step 4: Run test to verify it passes**

Run: `npm run test -- components/app-shell.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add components/app-shell.tsx components/bottom-nav.tsx app/globals.css components/app-shell.test.tsx
git commit -m "feat: convert shared shell to desktop-first layout"
```

### Task 4: Update The Feed For Desktop Grid Layout

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/issue-card.tsx`

**Step 1: Write the failing test**

- Add or extend a component test to assert multiple issue cards can render in a responsive grid container with unchanged CTA behavior

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL on the new feed layout expectation

**Step 3: Write minimal implementation**

- Convert the feed list from a single column stack to a responsive grid
- Adjust action controls so they wrap cleanly on desktop
- Update `IssueCard` sizing and `sizes` hints for wider layouts

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add app/page.tsx components/issue-card.tsx
git commit -m "feat: add desktop feed grid layout"
```

### Task 5: Update Report And Profile Layouts

**Files:**
- Modify: `app/report/page.tsx`
- Modify: `app/profile/page.tsx`

**Step 1: Write the failing tests**

- Add focused tests or assertions for:
  - report page split layout content presence
  - profile page summary and panel sections rendering together

**Step 2: Run test to verify they fail**

Run: `npm run test`
Expected: FAIL on the new report/profile expectations

**Step 3: Write minimal implementation**

- Change report page to a desktop split layout with form and preview/help content
- Change profile page to summary cards plus multi-column panels
- Keep mobile stacking behavior intact

**Step 4: Run test to verify they pass**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add app/report/page.tsx app/profile/page.tsx
git commit -m "feat: redesign report and profile for desktop"
```

### Task 6: Update Admin And Auth Layouts

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `app/auth/page.tsx`

**Step 1: Write the failing tests**

- Add focused tests or assertions for:
  - auth page renders in a standard web card layout
  - admin evidence and actions render in a wider desktop arrangement

**Step 2: Run test to verify they fail**

Run: `npm run test`
Expected: FAIL on the new admin/auth expectations

**Step 3: Write minimal implementation**

- Update admin cards for wider image comparison and better action placement
- Replace the auth page phone-width screen treatment with a centered website layout

**Step 4: Run test to verify they pass**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add app/admin/page.tsx app/auth/page.tsx
git commit -m "feat: redesign admin and auth for desktop"
```

### Task 7: Verify The Entire Redesign

**Files:**
- Verify: `components/app-shell.tsx`
- Verify: `components/bottom-nav.tsx`
- Verify: `components/issue-card.tsx`
- Verify: `app/page.tsx`
- Verify: `app/report/page.tsx`
- Verify: `app/profile/page.tsx`
- Verify: `app/admin/page.tsx`
- Verify: `app/auth/page.tsx`
- Verify: `app/globals.css`

**Step 1: Run tests**

Run: `npm run test`
Expected: PASS

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 3: Run production build**

Run: `npm run build`
Expected: PASS

**Step 4: Manually verify desktop routes**

Run: `npm run dev`
Expected: the app opens in a normal laptop-friendly layout across `/`, `/report`, `/profile`, `/admin`, and `/auth`

**Step 5: Commit**

```bash
git add components app package.json package-lock.json vitest.setup.ts
git commit -m "feat: redesign cleanmerit for desktop web layout"
```
