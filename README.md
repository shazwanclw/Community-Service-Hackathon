# CleanMerit

CleanMerit, also known as SnapFix Mentari, is a mobile-first Progressive Web App for reporting hazards, coordinating community fixes, and rewarding verified cleanup work inside Desa Mentari.

## Product Summary

The app uses a flat user model:

- Any authenticated user can report a hazard.
- Any authenticated user can claim and fix a hazard.
- Fixes are reviewed in a lightweight admin flow.
- Approved fixes award points to the fixer.

The experience is optimized for fast mobile use, image-first reporting, and clear community visibility.

## Tech Stack

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React

### Backend

- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Admin SDK for secure moderation actions

### AI

- Google Gemini via `@google/generative-ai`
- Model: `gemini-1.5-flash`

### Deployment

- Vercel

## Core Features

### Authentication

- Email/password login
- Email/password signup
- Automatic Firestore user profile creation on signup

### Feed

- Open hazard feed on `/`
- Hazard cards with before photo, description, and point value
- Claim flow for open issues

### Reporting

- Report page on `/report`
- Image upload to Firebase Storage
- Gemini-based hazard scoring
- Issue creation in Firestore with status `open`

### Fixing

- Dedicated fix submission flow on `/issues/[id]/fix`
- After-photo upload to Firebase Storage
- Issue status update to `pending`

### Moderation

- Protected admin view on `/admin`
- Pending issues with before/after comparison
- Approval endpoint secured with Firebase ID token verification
- Approved fixes increment the fixer's points

### Profile

- Current point balance
- Recent issue activity
- Static mock rewards catalog

## Firestore Schema

### `users`

Document ID: Firebase Auth `uid`

Fields:

- `email`
- `full_name`
- `total_points`

### `issues`

Fields:

- `reporter_id`
- `fixer_id`
- `status`
- `description`
- `before_photo_url`
- `after_photo_url`
- `point_value`
- `created_at`

### `rewards`

Fields:

- `item_name`
- `point_cost`

## Routes

- `/` open issues feed
- `/auth` login and signup
- `/report` report a new issue
- `/issues/[id]/fix` submit an after photo
- `/profile` wallet and rewards
- `/admin` moderation queue
- `/api/score-hazard` Gemini scoring endpoint
- `/api/admin/approve` secure issue approval endpoint

## Environment Variables

Create a local `.env.local` using `.env.example`.

### Public Firebase Client

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Admin

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### App Access Control

- `NEXT_PUBLIC_ADMIN_EMAILS`
- `ADMIN_EMAILS`

### Gemini

- `GEMINI_API_KEY`

## Local Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Run tests:

```bash
npm run test
```

Run lint:

```bash
npm run lint
```

Build for production:

```bash
npm run build
```

## Architecture Notes

- Client pages use the Firebase client SDK for auth, Firestore reads, and Storage uploads.
- Sensitive approval logic runs through a Next.js Route Handler backed by Firebase Admin.
- Gemini calls are server-side only and routed through `/api/score-hazard` so the API key is never exposed to the browser.
- The admin route uses email allowlists for simple moderation access. The page hides access in the client and the approval API enforces it on the server.

## Security Notes

- Storage and Firestore rules still need to be configured in Firebase Console for production use.
- The approval endpoint assumes valid Firebase Admin credentials are available in the deployment environment.
- `NEXT_PUBLIC_ADMIN_EMAILS` should match `ADMIN_EMAILS` to keep the UI and server behavior aligned.

## Current Status

The MVP structure, UI, Firebase wiring, Gemini integration, admin approval flow, and progress tracker are implemented in this repository.
