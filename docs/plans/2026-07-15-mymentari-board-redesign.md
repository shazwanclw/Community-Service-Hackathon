# MyMentari Board Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the main app UI around the screenshot-based MyMentari board design while preserving the current Next.js routes and Firebase-backed behavior.

**Architecture:** Introduce a shared maroon-and-cream board shell first, then migrate each route onto shared visual primitives so the redesign stays consistent across feed, report, issues, tasks, profile, leaderboard, and admin. Keep behavior changes minimal by refitting layout and presentation around existing data and actions.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Firebase client SDK, Vitest, ESLint.

---

### Task 1: Baseline The Shared Board Shell

**Files:**
- Modify: `components/app-shell.test.tsx`
- Inspect: `components/app-shell.tsx`
- Inspect: `components/bottom-nav.tsx`

**Step 1: Write the failing test**

- Extend the shell test to assert the brand label, sidebar navigation, board heading, and rendered main content all appear together.

**Step 2: Run test to verify it fails**

Run: `npm run test -- components/app-shell.test.tsx`
Expected: FAIL if the current shell no longer matches the new board expectations.

**Step 3: Write minimal implementation**

- Refactor the shared shell to match the board layout while preserving `title`, `subtitle`, `actions`, and children rendering.

**Step 4: Run test to verify it passes**

Run: `npm run test -- components/app-shell.test.tsx`
Expected: PASS

### Task 2: Replace The Global Theme

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Step 1: Write the failing test**

- Use the shell test expectations as the safety net for global theme changes.

**Step 2: Run test to verify it still constrains the redesign**

Run: `npm run test -- components/app-shell.test.tsx`
Expected: PASS before theme edits continue.

**Step 3: Write minimal implementation**

- Replace the global color tokens and body background with the cream-and-maroon board system.
- Preserve root layout correctness for Next.js App Router.

**Step 4: Run test to verify it passes**

Run: `npm run test -- components/app-shell.test.tsx`
Expected: PASS

### Task 3: Rebuild Shared Feed Card Styling

**Files:**
- Modify: `components/issue-card.tsx`

**Step 1: Write the failing test**

- Add or extend rendering assertions for the issue card’s feed-style content, including description and actions.

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL on the new card expectations.

**Step 3: Write minimal implementation**

- Convert the issue card to the denser social-board layout used by the screenshot family.

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

### Task 4: Restyle Home And Issues As Board Feeds

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/issues/page.tsx`
- Modify: `components/issue-preview-modal.tsx`

**Step 1: Write the failing test**

- Add focused render assertions where practical for titles, filters, and issue content.

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL on the new layout expectations.

**Step 3: Write minimal implementation**

- Rework Home into a screenshot-like feed.
- Rework Issues into a tabbed board list while preserving preview and claim flows.

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

### Task 5: Match The Report Board

**Files:**
- Modify: `app/report/page.tsx`

**Step 1: Write the failing test**

- Add a focused render assertion for the report board heading and composer structure if needed.

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL on the new report structure expectation.

**Step 3: Write minimal implementation**

- Rebuild the report screen around the screenshot’s centered composer card while keeping upload and submit behavior.

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

### Task 6: Make Tasks, Leaderboard, Profile, And Admin Consistent

**Files:**
- Modify: `app/tasks/page.tsx`
- Modify: `app/leaderboard/page.tsx`
- Modify: `app/profile/page.tsx`
- Modify: `app/admin/page.tsx`
- Modify: `app/auth/page.tsx`

**Step 1: Write the failing test**

- Reuse existing shell coverage and add route-level render assertions only where it meaningfully protects behavior.

**Step 2: Run test to verify it fails where new expectations were added**

Run: `npm run test`
Expected: FAIL on any newly introduced expectations.

**Step 3: Write minimal implementation**

- Refit each screen to the same board system without changing underlying workflow logic.
- Bring auth into the same family even though it is outside the main shell.

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

### Task 7: Verify The Full Redesign

**Files:**
- Verify: `app/layout.tsx`
- Verify: `app/globals.css`
- Verify: `components/app-shell.tsx`
- Verify: `components/bottom-nav.tsx`
- Verify: `components/issue-card.tsx`
- Verify: `app/page.tsx`
- Verify: `app/report/page.tsx`
- Verify: `app/issues/page.tsx`
- Verify: `app/tasks/page.tsx`
- Verify: `app/leaderboard/page.tsx`
- Verify: `app/profile/page.tsx`
- Verify: `app/admin/page.tsx`
- Verify: `app/auth/page.tsx`

**Step 1: Run tests**

Run: `npm run test`
Expected: PASS

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 3: Run production build**

Run: `npm run build`
Expected: PASS

**Step 4: Manually verify routes**

Run: `npm run dev`
Expected: the app reflects the screenshot-based board design across the primary routes.
