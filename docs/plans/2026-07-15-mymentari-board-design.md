# MyMentari Board Redesign Design

**Date:** 2026-07-15

**Status:** Approved

## Goal

Replace the current CleanMerit desktop theme with the screenshot-based MyMentari board design and apply that visual system consistently across the main product routes.

## Source Of Truth

The user-provided screenshot is the primary reference.

Core cues from the reference:

- Flat cream application canvas
- Narrow left sidebar with maroon icons, labels, and an active pill
- Red-to-blush board header gradient
- Minimal border treatment with very light shadowing
- Compact social-feed layout for content-heavy screens
- Maroon-first action styling and restrained typography

## Decision

Adopt the screenshot as the new design system for the application shell and all major board pages:

- `/`
- `/report`
- `/issues`
- `/tasks`
- `/leaderboard`
- `/profile`
- `/admin`

The current green-and-sand desktop redesign is no longer the visual reference.

## Chosen Approach

Use a shared board shell with page-specific content modules.

Why this approach:

- It preserves existing Firebase-backed behavior and route structure
- It gives all screens a single visual grammar instead of page-by-page styling drift
- It makes the shown reference easy to match closely on `Report`, `Home`, and `Issues`
- It keeps the remaining routes consistent without inventing a second theme

## Layout Architecture

### Shared shell

Every authenticated app route will use the same top-level structure:

- Fixed-width cream sidebar on desktop
- Main board panel with bordered content area
- Shared board header with title and subtitle
- Mobile fallback navigation that still uses the same color system

### Board canvas

The main content region will shift from the current rounded, glassy container to a flatter board-like surface:

- Thin neutral border
- Very subtle elevation
- Square-to-soft-corner geometry instead of oversized pill cards everywhere
- More literal section framing, matching the screenshot

## Visual System

### Color

- Primary maroon: navigation, headings, primary actions
- Soft blush gradient: board headers and tab bands
- Warm cream: overall background and form surfaces
- Neutral brown-gray: borders, helper text, secondary icons

### Typography

- Keep the existing loaded fonts unless a change is required for a closer match
- Use tighter, denser sizing than the current desktop redesign
- Board titles become larger and cleaner
- Secondary copy becomes compact and practical

### Components

Shared reusable primitives:

- Sidebar nav item
- Board header
- Section tabs
- Feed/post card
- Stat row
- Composer/report card
- Neutral empty state

## Page Behavior

### Home

- Convert the current issue feed into a social board feed
- Emphasize reporter identity, timestamp, description, image group, and simple reaction row
- Preserve existing like, comment, and claim behavior

### Report

- Match the provided screenshot closely
- Center the report composer card inside the board
- Keep current upload and submit logic

### Issues

- Replace the table-like presentation with category tabs and a feed/list board
- Keep preview and claim actions
- Use category tabs as the primary interaction affordance

### Tasks

- Recast task states into the same board language as Issues
- Keep active, review, and completed segmentation

### Leaderboard

- Present rankings as a clean board list with stronger row hierarchy

### Profile

- Simplify profile into stat cards and recent activity panels that still feel like part of the same board family

### Admin

- Keep the moderation workflow, but restyle it with the same shell and card language

## Risks

- The screenshot is desktop-oriented, so mobile adaptation requires interpretation
- Existing page structures vary, so consistency depends on extracting shared board primitives
- Some interactions may need tighter content limits to avoid visual overflow in the new denser layout

## Testing Strategy

- Keep existing behavior tests intact
- Add or extend shell-level coverage for the shared board structure
- Run `npm run test`
- Run `npm run lint`
- Run `npm run build`
- Manually verify the main routes in the browser

## Success Criteria

- The app visually matches the screenshot family rather than the previous green desktop redesign
- `Report`, `Home`, and `Issues` clearly reflect the provided reference
- `Tasks`, `Leaderboard`, `Profile`, and `Admin` feel like part of the same product
- Existing reporting, claiming, liking, commenting, and moderation flows still work
