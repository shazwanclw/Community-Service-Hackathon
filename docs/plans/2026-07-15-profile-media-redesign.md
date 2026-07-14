# Profile And Media Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add persisted user profile identity fields and multi-image issue reporting, then refit the home, report, issues, and profile pages around those capabilities.

**Architecture:** Extend the Firestore-backed profile and issue types first, then add pure helpers that normalize names, avatars, and issue media so old and new records can coexist cleanly. Use those helpers across the feed, report flow, and profile editor to keep the UI simple and consistent.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Firebase Auth, Firestore, Firebase Storage, Vitest, ESLint.

---

### Task 1: Add Identity And Media Helper Coverage

**Files:**
- Create: `lib/profile-display.ts`
- Create: `lib/profile-display.test.ts`
- Modify: `lib/types.ts`

**Step 1: Write the failing test**

- Add tests for:
  - username-first display name resolution
  - initials fallback generation
  - normalized issue image list for old single-image and new multi-image records

**Step 2: Run test to verify it fails**

Run: `npm run test -- lib/profile-display.test.ts`
Expected: FAIL because the helper module does not exist yet.

**Step 3: Write minimal implementation**

- Add helper functions for:
  - `getDisplayName`
  - `getDisplayInitials`
  - `getIssueBeforePhotoUrls`

**Step 4: Run test to verify it passes**

Run: `npm run test -- lib/profile-display.test.ts`
Expected: PASS

### Task 2: Extend The Persisted Profile And Issue Schema

**Files:**
- Modify: `lib/types.ts`
- Modify: `components/auth-provider.tsx`
- Modify: `app/auth/page.tsx`

**Step 1: Write the failing test**

- Reuse helper tests and type-driven compilation as the safety net.

**Step 2: Run test to verify current assumptions**

Run: `npm run test -- lib/profile-display.test.ts`
Expected: PASS before production changes.

**Step 3: Write minimal implementation**

- Extend `UserProfile` with `username` and `profile_photo_url`
- Extend `IssueRecord` with multi-image and reporter snapshot fields
- Initialize new profile fields on signup

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

### Task 3: Support Multi-Image Report Creation

**Files:**
- Modify: `app/report/page.tsx`
- Modify: `lib/types.ts`

**Step 1: Write the failing test**

- Add helper-level coverage for normalized image arrays if more cases are needed.

**Step 2: Run test to verify it fails**

Run: `npm run test -- lib/profile-display.test.ts`
Expected: FAIL if new image normalization cases were added first.

**Step 3: Write minimal implementation**

- Remove category UI
- Support selecting up to 3 images
- Upload each image
- Save:
  - `before_photo_urls`
  - legacy `before_photo_url` using the first image
  - reporter name, username, and profile photo snapshot

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

### Task 4: Refactor Feed Cards For Username, Avatar, And Media Carousel

**Files:**
- Modify: `components/issue-card.tsx`
- Modify: `app/page.tsx`
- Modify: `app/api/issues/comment/route.ts`

**Step 1: Write the failing test**

- Add tests for display helpers if new identity/comment edge cases are needed first.

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL on the newly added helper assertions.

**Step 3: Write minimal implementation**

- Use username-first display text
- Show profile photo or initials avatar
- Enlarge points and status badges
- Render single-image or scrollable multi-image media
- Make like heart red when liked
- Make comment icon toggle comments open and closed
- Ensure new comments use username/full-name fallback consistently

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

### Task 5: Rebuild Issues As A Table-Oriented List With On-Demand Filters

**Files:**
- Modify: `app/issues/page.tsx`

**Step 1: Write the failing test**

- Add a focused rendering expectation only if needed for the filter button or list structure.

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL on the new expectation if one was added.

**Step 3: Write minimal implementation**

- Remove category tabs
- Restore a cleaner table/list format
- Add a filter icon button that reveals filter choices only when clicked

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

### Task 6: Simplify And Make Profile Editable

**Files:**
- Modify: `app/profile/page.tsx`
- Modify: `lib/firebase.ts` or client usage only if required for uploads

**Step 1: Write the failing test**

- Add helper assertions only if needed to protect profile-display behavior.

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL only if new assertions were added first.

**Step 3: Write minimal implementation**

- Build a simpler profile layout with:
  - editable full name
  - editable username
  - editable profile photo
  - one non-duplicated stats section
- Persist changes directly to the user document

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

### Task 7: Verify The Full Redesign

**Files:**
- Verify: `app/auth/page.tsx`
- Verify: `app/report/page.tsx`
- Verify: `app/page.tsx`
- Verify: `components/issue-card.tsx`
- Verify: `app/issues/page.tsx`
- Verify: `app/profile/page.tsx`
- Verify: `components/auth-provider.tsx`
- Verify: `lib/types.ts`
- Verify: `lib/profile-display.ts`

**Step 1: Run tests**

Run: `npm run test`
Expected: PASS

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 3: Run production build**

Run: `npm run build`
Expected: PASS

**Step 4: Manually verify flows**

Run: `npm run dev`
Expected:
- profile edits persist
- single-image reports still work
- three-image reports preview and render correctly
- home feed shows username/avatar fallback correctly
- issues remain easy to scan
