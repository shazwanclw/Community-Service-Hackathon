# Profile And Media Redesign Design

**Date:** 2026-07-15

**Status:** Approved

## Goal

Add real saved profile identity settings and richer report media handling, then update the feed, report, issues, and profile pages to use that data consistently.

## User Decisions

- `username` must be a persisted user setting
- `profile photo` must be a persisted user setting
- Home should show username first, then full name as fallback
- Home avatar should use profile photo when present, otherwise initials
- Report should support up to 3 images
- Report categories should be removed
- Issues should return to a cleaner table-oriented scan pattern
- Profile should become simpler and editable without duplicated stat sections

## Source Of Truth

### User profile

The Firestore `users/{uid}` document becomes the source of truth for:

- `full_name`
- `email`
- `username`
- `profile_photo_url`
- `total_points`

### Issue feed identity snapshot

When a user creates a report, issue documents should store a snapshot of the reporter’s current display data:

- `reporter_name`
- `reporter_username`
- `reporter_profile_photo_url`

This keeps feed rendering fast and stable while still letting the profile page remain the editable source of truth.

### Report images

Issue documents should support multiple uploaded before-images:

- new field: `before_photo_urls`
- preserve compatibility with older `before_photo_url` records

The feed and issues pages should normalize old and new issue records into one image list.

## Data Model

### `users`

Add:

- `username?: string | null`
- `profile_photo_url?: string | null`

### `issues`

Add:

- `before_photo_urls?: string[] | null`
- `reporter_username?: string | null`
- `reporter_profile_photo_url?: string | null`

Keep:

- `before_photo_url` for backward compatibility

## UI Behavior

### Home feed

- Profile circle shows `reporter_profile_photo_url` when present
- Otherwise show initials from username or full name
- Display name uses `reporter_username` first, then `reporter_name`
- Points and status badges become larger and more prominent
- One uploaded image renders as one image
- Multiple uploaded images render inside a horizontally scrollable media strip
- Like heart becomes red when liked
- Comment icon toggles comment section open and closed

### Report page

- Remove category selector
- Simplify form to:
  - image upload section
  - issue description section
- Support 1 to 3 images
- Show upload previews before submit

### Issues page

- Remove category tabs
- Return to a more scannable table/list layout
- Replace always-visible sort select with a filter button that reveals choices on demand

### Profile page

- Replace the current duplicated stat treatment with one simpler profile layout
- Include:
  - profile photo
  - full name
  - email
  - username
  - total points
  - reports count
  - active/review/completed counts
- Make it easy to edit name, username, and photo in one place

## Implementation Approach

1. Extend the shared types and add pure helper functions for:
   - display name resolution
   - initials fallback
   - issue image normalization
2. Add tests for those helpers first
3. Update signup and profile editing so profile data persists in Firestore
4. Update report creation to upload and save up to 3 images
5. Refactor feed and issues rendering to consume normalized issue media and identity data
6. Simplify the profile page and remove duplicated stats

## Risks

- Existing issue documents only contain one image and no username/photo snapshot
- Profile photo upload requires a stable Storage path and graceful fallback behavior
- Feed rendering must remain backward compatible while old and new issue shapes coexist

## Testing Strategy

- Add pure helper coverage for identity and media normalization
- Run `npm run test`
- Run `npm run lint`
- Run `npm run build`
- Manually verify:
  - profile edit
  - report with 1 image
  - report with 3 images
  - home feed avatar/name fallbacks
  - issues filter behavior

## Success Criteria

- Users can save a username and profile photo from profile
- Home shows username-first identity and proper avatar fallback
- Reports support up to 3 images with preview
- Home feed renders 1 or many report images correctly
- Issues are easier to scan again
- Profile is simpler and no longer duplicates task-summary stats
