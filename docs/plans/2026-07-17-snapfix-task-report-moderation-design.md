# SnapFix Task, Report, and Moderation Design

## Scope

Address the published-task claim hang, add task release and task-route subtabs, improve the continue-task layout, rename visible branding to SnapFix, support report submissions when AI cannot assign a task score, split moderation into repair and point-review queues, add AI-assisted report captions, award report points, and gate all non-home routes behind authentication.

## Production Claim Flow

The current task-claim flow depends on `/api/issues/claim`, which verifies a Firebase ID token and writes through Firebase Admin. On localhost this works because local admin credentials are present. On the published site the user sees an indefinite spinner, which indicates the client currently has no timeout and the server path can stall when deployed Firebase Admin configuration or verification is unavailable.

The fix keeps the current architecture and adds defensive handling at both layers:

- The client request helper will support an abort timeout and surface actionable errors.
- The claim route will fail fast with explicit configuration errors instead of appearing to hang forever.
- The issue board will stop spinning and show a real error state when claiming fails.

## Task and Navigation UX

Tasks stay under `/tasks`, but the UI will introduce a secondary tab row that clarifies the current sub-view:

- `Active claims`
- `Waiting review`
- `Completed`
- `Continue task` state when the user is inside `/issues/[id]/fix`

The fix page will adopt wider spacing between header and content and between its internal sections so the layout reads less cramped on desktop and mobile. Active claimed tasks will also get a `Remove task` action that releases the claim and returns the issue to the open queue.

## Report Scoring and Rewards

Reports should always submit when the base form is valid. The report flow will treat AI scoring as a best effort:

- If AI can score the issue, the issue becomes immediately claimable with that point value.
- If AI cannot score confidently, the report is stored with a moderation-needed points state and a user-facing label such as `Waiting for admin points approval`.
- Reports waiting on manual points cannot be claimed yet.

The reporter also earns a fixed `10` points for every submitted report. This reward will be described in the report UI and credited during report submission.

## Moderation Queues

Moderation will be split into two subtabs:

- `Repair submissions`: the existing before/after approval queue.
- `Point review`: reports that still need a moderator-assigned point value because AI scoring was unavailable.

Point review moderators can assign a point value, transition the report into a normal open task, and remove the blocking state that currently prevents claiming.

## Report Authoring

The report form will add an AI assistance control next to the issue details area. Users can request an AI-generated caption/description from the uploaded image set and location, then edit the generated text before submitting. This keeps manual editing available while helping users who do not want to write the description from scratch.

## Auth Gating

Home remains public. All other main routes will render a locked/sign-in-required state when the viewer is not authenticated, matching the existing profile-page pattern instead of redirecting immediately. This keeps navigation coherent and prevents unauthenticated interaction outside the home page.

## Data Model Changes

The existing `issues` collection will gain minimal additive fields to support the new behavior:

- point moderation status
- optional manual point value source / label
- claim eligibility derived from moderation state
- explicit report reward handling

These additions preserve backward compatibility with existing documents and keep the current task lifecycle logic centralized in `lib/issue-lifecycle.ts`.
