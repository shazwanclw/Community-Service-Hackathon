# Shell And Report Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove authenticated shell viewport gaps and make report submission resilient to hazard scoring failures.

**Architecture:** Adjust the shared `AppShell` wrapper so the board fills the viewport instead of sitting inside an outer padded frame. Move report-scoring resilience to the server-side scoring path so the client report flow can continue without branching on Gemini availability.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, Firebase, Gemini API

---

### Task 1: Document The Layout Regression In Tests

**Files:**
- Modify: `components/app-shell.test.tsx`

**Step 1: Write the failing test**

Add a test that renders `AppShell` and asserts the outer wrapper uses full-width flush viewport classes.

**Step 2: Run test to verify it fails**

Run: `npm test -- components/app-shell.test.tsx`

Expected: FAIL because the wrapper still uses outer spacing and width constraints.

**Step 3: Write minimal implementation**

Update `AppShell` wrapper classes to remove outer top/right gaps and allow full-width layout.

**Step 4: Run test to verify it passes**

Run: `npm test -- components/app-shell.test.tsx`

Expected: PASS

### Task 2: Preserve Report Creation When Scoring Fails

**Files:**
- Add: `app/api/score-hazard/route.test.ts`
- Add: `lib/hazard-score.ts`
- Modify: `app/api/score-hazard/route.ts`

**Step 1: Write the failing tests**

Add route tests that verify scorer success returns scorer output and scorer failure returns a fallback score object.

**Step 2: Run tests to verify they fail**

Run: `npm test -- app/api/score-hazard/route.test.ts`

Expected: FAIL because the route currently returns `500` on scorer failure.

**Step 3: Write minimal implementation**

Create a shared fallback score helper and use it in the route when Gemini analysis throws after request validation passes.

**Step 4: Run tests to verify they pass**

Run: `npm test -- app/api/score-hazard/route.test.ts`

Expected: PASS

### Task 3: Verify Integration

**Files:**
- Modify: `components/app-shell.tsx`

**Step 1: Run targeted regression tests**

Run: `npm test -- components/app-shell.test.tsx app/api/score-hazard/route.test.ts`

Expected: PASS

**Step 2: Run the full suite**

Run: `npm run test`

Expected: PASS

**Step 3: Run lint if time permits**

Run: `npm run lint`

Expected: PASS
