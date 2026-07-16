# Compact Shell Header Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the shared authenticated page header much smaller in typography and vertical height.

**Architecture:** Update the single shared `AppShell` header so all pages inherit the compact presentation automatically. Keep the current structure and visual treatment, but reduce title scale, subtitle scale, and header padding.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Vitest

---

### Task 1: Lock Compact Header Behavior In Tests

**Files:**
- Modify: `components/app-shell.test.tsx`

**Step 1: Write the failing test**

Assert that the title and subtitle use smaller classes and that the header content wrapper uses tighter vertical padding.

**Step 2: Run test to verify it fails**

Run: `npm test -- components/app-shell.test.tsx`

Expected: FAIL because the current header still uses oversized typography and spacing.

**Step 3: Write minimal implementation**

Update `components/app-shell.tsx` to use smaller title, subtitle, and header padding classes.

**Step 4: Run test to verify it passes**

Run: `npm test -- components/app-shell.test.tsx`

Expected: PASS

### Task 2: Verify The Full Suite

**Files:**
- Modify: `components/app-shell.tsx`

**Step 1: Run the full suite**

Run: `npm run test`

Expected: PASS
