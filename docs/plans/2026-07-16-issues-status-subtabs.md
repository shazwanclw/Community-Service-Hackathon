# Issues Status Subtabs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Issues page use Tasks-style status subtabs while keeping the filter button for sort only.

**Architecture:** Update `app/issues/page.tsx` so status filtering is controlled by inline tab buttons rendered above the table. Preserve the current sorting logic and dropdown trigger, but remove status entries from the dropdown menu.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Vitest, Testing Library

---

### Task 1: Lock The New Issues Controls In Tests

**Files:**
- Add: `app/issues/page.test.tsx`

**Step 1: Write the failing test**

Render the Issues page with mocked Firestore data and assert:
- all four status subtabs are visible
- opening `Filter` shows sort options only
- status options are not present in the menu

**Step 2: Run test to verify it fails**

Run: `npm test -- app/issues/page.test.tsx`

Expected: FAIL because the current page still puts status filtering inside the dropdown.

**Step 3: Write minimal implementation**

Update `app/issues/page.tsx` to render status subtabs and reduce the filter menu to sort options only.

**Step 4: Run test to verify it passes**

Run: `npm test -- app/issues/page.test.tsx`

Expected: PASS

### Task 2: Verify The Full Suite

**Files:**
- Modify: `app/issues/page.tsx`

**Step 1: Run the full suite**

Run: `npm run test`

Expected: PASS
