# Sidebar Width And Scroll Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Widen the desktop sidebar and make the main content pane scroll independently while the sidebar stays fully visible.

**Architecture:** Keep the existing `AppShell` structure but change the desktop shell into a fixed-height split layout. The sidebar remains a full-height desktop column, and the right pane becomes the only scrolling region for page content.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Vitest

---

### Task 1: Lock The Desired Shell Behavior In Tests

**Files:**
- Modify: `components/app-shell.test.tsx`

**Step 1: Write the failing test**

Assert that the desktop sidebar uses a wider width class and that the right pane uses an overflow-scrolling class.

**Step 2: Run test to verify it fails**

Run: `npm test -- components/app-shell.test.tsx`

Expected: FAIL because the sidebar is still narrow and the right pane is not the isolated scroll container.

**Step 3: Write minimal implementation**

Update `components/app-shell.tsx` to widen the desktop sidebar and move scrolling responsibility to the content pane.

**Step 4: Run test to verify it passes**

Run: `npm test -- components/app-shell.test.tsx`

Expected: PASS

### Task 2: Verify The Whole UI Test Suite

**Files:**
- Modify: `components/app-shell.tsx`

**Step 1: Run the full suite**

Run: `npm run test`

Expected: PASS
