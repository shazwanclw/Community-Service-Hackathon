# Issues Filter Dropdown Visibility Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent the Issues filter dropdown from being clipped behind the content area.

**Architecture:** Fix the problem at the shared shell level because the dropdown lives inside `AppShell`'s header. Removing header clipping and ensuring the header stacks above the body solves the menu visibility issue for this filter and similar future popovers.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Vitest

---

### Task 1: Lock The Shell Overflow Behavior In Tests

**Files:**
- Modify: `components/app-shell.test.tsx`

**Step 1: Write the failing test**

Assert that the shell header does not use `overflow-hidden`.

**Step 2: Run test to verify it fails**

Run: `npm test -- components/app-shell.test.tsx`

Expected: FAIL because the header still clips overflow.

**Step 3: Write minimal implementation**

Update `components/app-shell.tsx` so the header allows visible overflow and sits above the content stacking context.

**Step 4: Run test to verify it passes**

Run: `npm test -- components/app-shell.test.tsx`

Expected: PASS

### Task 2: Verify The Full Suite

**Files:**
- Modify: `components/app-shell.tsx`

**Step 1: Run the full suite**

Run: `npm run test`

Expected: PASS
