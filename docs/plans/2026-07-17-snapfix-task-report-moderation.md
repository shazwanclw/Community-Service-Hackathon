# SnapFix Task, Report, and Moderation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the published task-claim hang and implement the requested SnapFix task, report, moderation, branding, and auth-gating changes.

**Architecture:** Keep the current Next.js App Router and Firebase-based design, add defensive request handling around Firebase Admin routes, extend the issue lifecycle with additive moderation metadata, and update the existing route components to reflect the new states. Follow TDD for lifecycle logic, shell gating, report submission behavior, and issue/task interactions before production changes.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Firebase client SDK, Firebase Admin SDK, Vitest, Testing Library

---

### Task 1: Add lifecycle coverage for manual point review and claim eligibility

**Files:**
- Modify: `lib/issue-lifecycle.test.ts`
- Modify: `lib/types.ts`
- Modify: `lib/issue-lifecycle.ts`

**Step 1: Write the failing test**

Add tests covering:
- reports waiting for manual point approval are not claimable
- manually scored open reports become claimable
- released claims return to the available phase

**Step 2: Run test to verify it fails**

Run: `npm test -- lib/issue-lifecycle.test.ts`
Expected: FAIL because the new moderation fields and lifecycle behavior do not exist yet.

**Step 3: Write minimal implementation**

Add additive issue fields for point moderation state and update lifecycle derivation so claimability depends on both task status and points readiness.

**Step 4: Run test to verify it passes**

Run: `npm test -- lib/issue-lifecycle.test.ts`
Expected: PASS

### Task 2: Add failing tests for SnapFix shell branding and locked-route behavior

**Files:**
- Modify: `components/app-shell.test.tsx`
- Modify: `components/app-shell.tsx`
- Modify: `components/bottom-nav.tsx`

**Step 1: Write the failing test**

Add tests covering:
- visible brand text is `SnapFix`
- non-home routes render a locked state for signed-out users
- home remains accessible when signed out

**Step 2: Run test to verify it fails**

Run: `npm test -- components/app-shell.test.tsx`
Expected: FAIL because the shell still renders `CleanMerit` and does not provide the shared auth gate.

**Step 3: Write minimal implementation**

Add a reusable locked-state shell behavior and update visible brand text to `SnapFix`.

**Step 4: Run test to verify it passes**

Run: `npm test -- components/app-shell.test.tsx`
Expected: PASS

### Task 3: Add failing tests for issue-board claim handling and point-pending rows

**Files:**
- Modify: `app/issues/page.test.tsx`
- Modify: `app/issues/page.tsx`
- Modify: `lib/client-api.ts`

**Step 1: Write the failing test**

Add tests covering:
- claim requests time out and show an error instead of spinning indefinitely
- point-pending reports show a waiting-for-admin-points label and no `Take task` button

**Step 2: Run test to verify it fails**

Run: `npm test -- app/issues/page.test.tsx`
Expected: FAIL because claim requests have no timeout and point-pending states are not rendered.

**Step 3: Write minimal implementation**

Extend the authed POST helper with timeout support and update the issue board rendering and claim handler.

**Step 4: Run test to verify it passes**

Run: `npm test -- app/issues/page.test.tsx`
Expected: PASS

### Task 4: Add failing tests for report score fallback behavior

**Files:**
- Modify: `app/api/score-hazard/route.test.ts`
- Modify: `app/api/score-hazard/route.ts`
- Modify: `lib/hazard-score.ts`

**Step 1: Write the failing test**

Add coverage for:
- explicit fallback payloads that indicate AI score is pending moderator review
- the API still returning a successful response shape

**Step 2: Run test to verify it fails**

Run: `npm test -- app/api/score-hazard/route.test.ts`
Expected: FAIL because fallback responses currently look like normal scored responses.

**Step 3: Write minimal implementation**

Return a structured fallback response that preserves submission flow while distinguishing manual point review.

**Step 4: Run test to verify it passes**

Run: `npm test -- app/api/score-hazard/route.test.ts`
Expected: PASS

### Task 5: Implement report submission, AI caption assist, and report reward credit

**Files:**
- Modify: `app/report/page.tsx`
- Modify: `lib/types.ts`
- Modify: `lib/gemini.ts`
- Modify: `lib/firebase.ts` or report submission helpers if needed

**Step 1: Write the failing test**

Add the smallest practical component or helper tests for:
- AI caption requests filling the description field
- fallback-scored reports storing a waiting state message

**Step 2: Run test to verify it fails**

Run: targeted `npm test -- ...`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement AI caption generation, report reward messaging, report reward persistence, and fallback point moderation fields on submitted issues.

**Step 4: Run test to verify it passes**

Run: targeted `npm test -- ...`
Expected: PASS

### Task 6: Implement task release and continue-task layout improvements

**Files:**
- Modify: `app/tasks/page.tsx`
- Modify: `app/issues/[id]/fix/page.tsx`
- Create: `app/api/issues/release/route.ts`

**Step 1: Write the failing test**

Add focused UI or helper tests for:
- active tasks expose a `Remove task` action
- continue-task screen spacing and task-context subtab rendering

**Step 2: Run test to verify it fails**

Run: targeted `npm test -- ...`
Expected: FAIL

**Step 3: Write minimal implementation**

Add the release route, wire the active-task action, and update the fix page layout and task sub-navigation treatment.

**Step 4: Run test to verify it passes**

Run: targeted `npm test -- ...`
Expected: PASS

### Task 7: Implement moderation subtabs for repair approvals and manual point assignment

**Files:**
- Modify: `app/admin/page.tsx`
- Create or modify: `app/api/admin/...` routes as needed

**Step 1: Write the failing test**

Add tests or helper coverage for:
- moderation default tab remains repair submissions
- point-review tab lists only reports waiting on manual points

**Step 2: Run test to verify it fails**

Run: targeted `npm test -- ...`
Expected: FAIL

**Step 3: Write minimal implementation**

Render the two moderation subtabs and add the admin action for assigning point values.

**Step 4: Run test to verify it passes**

Run: targeted `npm test -- ...`
Expected: PASS

### Task 8: Update metadata and visible branding references to SnapFix

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/manifest.ts`
- Modify: `package.json`
- Modify any user-facing branding strings in `app/` and `components/`

**Step 1: Write the failing test**

Rely on updated shell test assertions and add any narrow metadata test only if needed.

**Step 2: Run test to verify it fails**

Run: existing affected test command(s)
Expected: FAIL if branding is not updated.

**Step 3: Write minimal implementation**

Replace user-facing `CleanMerit` or `MyMentari` branding with `SnapFix`, leaving historical plan docs untouched.

**Step 4: Run test to verify it passes**

Run: affected test command(s)
Expected: PASS

### Task 9: Run verification

**Files:**
- No code changes required unless failures appear

**Step 1: Run targeted tests**

Run: `npm test`
Expected: PASS

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 3: Run production build**

Run: `npm run build`
Expected: PASS
