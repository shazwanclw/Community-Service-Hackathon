# CleanMerit MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the full CleanMerit MVP with Firebase-backed auth, issue reporting, fixing, moderation, and a mobile-first Next.js interface.

**Architecture:** Use the Next.js App Router with client-side Firebase SDK access for auth, Firestore reads, and Storage uploads. Keep sensitive moderation and Gemini work server-side in Route Handlers backed by Firebase Admin and a server-only Gemini utility.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Firebase client SDK, Firebase Admin SDK, Google Gemini SDK, Vitest.

---

### Task 1: Project Foundation

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Create: `TODO.md`
- Create: `.env.example`

**Step 1: Add project scripts and dependencies**

- Add test scripts and required packages.

**Step 2: Document the architecture**

- Replace starter docs with project-specific setup and route guidance.

### Task 2: Core Utilities

**Files:**
- Create: `lib/firebase.ts`
- Create: `lib/firebase-admin.ts`
- Create: `lib/gemini.ts`
- Create: `lib/score-parser.ts`
- Create: `lib/admin-access.ts`
- Create: `lib/types.ts`
- Test: `lib/score-parser.test.ts`

**Step 1: Write failing tests for Gemini score parsing**

- Cover valid JSON, fenced JSON, clamping, and invalid payload behavior.

**Step 2: Implement minimal parsing logic**

- Normalize raw Gemini output into strict issue scores.

**Step 3: Add Firebase and admin initialization helpers**

- Read from environment variables and guard against duplicate app initialization.

### Task 3: Shared UI and Auth State

**Files:**
- Create: `components/auth-provider.tsx`
- Create: `components/app-shell.tsx`
- Create: `components/bottom-nav.tsx`
- Create: `components/issue-card.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Step 1: Build auth context**

- Subscribe to Firebase Auth and Firestore profile state.

**Step 2: Build mobile shell**

- Provide navigation and consistent layout.

### Task 4: Product Pages

**Files:**
- Modify: `app/page.tsx`
- Create: `app/auth/page.tsx`
- Create: `app/report/page.tsx`
- Create: `app/profile/page.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/issues/[id]/fix/page.tsx`

**Step 1: Implement auth page**

- Support login and signup with Firestore profile creation.

**Step 2: Implement feed**

- Query open issues and render action cards.

**Step 3: Implement reporting and fixing flows**

- Upload images, score hazards, and update Firestore issue states.

**Step 4: Implement admin and profile views**

- Show moderation queue, approval actions, points, and rewards.

### Task 5: Secure Endpoints

**Files:**
- Create: `app/api/score-hazard/route.ts`
- Create: `app/api/admin/approve/route.ts`

**Step 1: Build scoring endpoint**

- Accept image input and return normalized Gemini scores.

**Step 2: Build approval endpoint**

- Verify Firebase ID token, validate admin access, and apply Firestore transaction.

### Task 6: Verification

**Files:**
- Modify: `package.json`

**Step 1: Run tests**

- Verify parser behavior.

**Step 2: Run lint and production build**

- Confirm the app compiles cleanly.
