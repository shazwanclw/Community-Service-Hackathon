# CleanMerit Desktop Redesign Design

**Date:** 2026-06-28

**Status:** Approved

## Goal

Convert the current mobile-framed prototype into a normal laptop-friendly website while preserving the existing CleanMerit brand, route structure, and mobile responsiveness.

## Problem

The current UI is intentionally constrained to a phone-sized shell:

- `components/app-shell.tsx` wraps the app in `max-w-md`
- `components/bottom-nav.tsx` is the primary navigation pattern
- `app/auth/page.tsx` also uses a phone-width centered column

On a laptop, this makes the product look like a mobile mockup instead of a web application.

## Decision

Use a desktop-first responsive shell that still collapses cleanly for smaller screens.

This keeps the current visual language, but changes the information architecture:

- Desktop gets a persistent left sidebar and a wider content canvas
- Mobile keeps compact navigation and stacked sections
- Shared page content is re-laid out for laptop viewing instead of being stretched from a mobile column

## Chosen Approach

Recommended approach: evolve the current product into a standard responsive website shell.

Why this approach:

- It fixes the root cause rather than masking it
- It preserves the existing brand colors, typography, and flows
- It improves every route consistently instead of patching only the home page
- It avoids turning the whole product into an admin dashboard

## Layout Architecture

### Root shell

The app shell will become a full-width responsive frame with these regions:

- Left sidebar on desktop for primary navigation
- Main content area with a route header and page body
- Mobile fallback navigation that does not dominate desktop

### Width strategy

- Remove `max-w-md` shell constraints from shared app layout
- Replace single narrow columns with content containers sized for desktop reading and task work
- Use max-widths per content region, not a phone-width max on the whole application

### Navigation

- Desktop: persistent sidebar with route links, product mark, account summary, and sign-out action
- Mobile: compact bottom navigation remains available as a fallback only on small screens
- Active route highlighting remains consistent across both navigation modes

## Page-Level Design

### Feed

- Keep a strong page intro with title, subtitle, and primary action
- Move issue cards into a responsive grid
- Show summary information such as open task count without consuming the full page width

### Report

- Use a two-column desktop layout
- Left column: report form
- Right column: image preview, guidance, and submission context
- Collapse to a single column on smaller screens

### Profile

- Promote points, approvals, and progress into summary cards
- Place rewards and recent activity into adjacent panels on desktop
- Keep a stacked version for mobile

### Admin

- Use a wider moderation workspace
- Before/after images remain side by side but gain more room
- Keep approval actions close to evidence and description

### Auth

- Replace the phone-height centered panel with a standard website auth layout
- Preserve the same copy and form structure
- Use a centered card inside a wider page backdrop

## Visual Direction

Preserve the existing identity:

- Same green, sand, cream, and sun palette
- Same type families from `app/layout.tsx`
- Same rounded card language

Adjust for desktop:

- More whitespace between regions
- Clearer section hierarchy
- Larger canvases for grids, forms, and image comparison
- Less “device mockup” feeling from shadows and centered narrow framing

## Components Affected

- `components/app-shell.tsx`
- `components/bottom-nav.tsx`
- `components/issue-card.tsx`
- `app/page.tsx`
- `app/report/page.tsx`
- `app/profile/page.tsx`
- `app/admin/page.tsx`
- `app/auth/page.tsx`
- `app/globals.css`

## Responsive Rules

- Desktop is the primary layout target
- Tablet and mobile remain supported
- Navigation changes by breakpoint
- Grids collapse progressively instead of preserving phone-only composition

## Risks

- Some pages may depend on current stacked spacing and need local layout adjustment
- `IssueCard` image sizing and CTA spacing may need retuning for grid contexts
- Desktop navigation changes can affect route rhythm if not applied consistently

## Testing Strategy

- Add targeted UI tests only if there is existing coverage support for the affected behavior
- At minimum run `npm run lint` and `npm run test`
- Run a production build with `npm run build`
- Manually verify the home, report, profile, admin, and auth routes at laptop width and mobile width

## Success Criteria

- The app no longer renders as a narrow phone-width column on laptop
- Primary navigation feels like a normal website on desktop
- Core pages use available horizontal space effectively
- Mobile layouts still remain usable and coherent
