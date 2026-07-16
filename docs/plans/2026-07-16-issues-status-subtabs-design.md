# Issues Status Subtabs Design

**Date:** 2026-07-16

**Status:** Approved

## Goal

Replace the Issues page status filter dropdown options with inline subtabs that match the Tasks page pattern.

## User Decisions

- The Issues page should use inline status subtabs.
- The subtabs should be:
  - `All`
  - `Active claim`
  - `Waiting review`
  - `Completed`
- The `Filter` button should remain for sort controls only.

## Chosen Approach

- Reuse the Tasks page tab pattern for status filtering on the Issues page.
- Keep the existing sort dropdown trigger and options.
- Remove status options from the dropdown.
- Keep the current status filter logic, but drive it from tab state instead of menu clicks.

## Testing Strategy

- Add an Issues page regression test that:
  - renders the four status subtabs
  - confirms the filter menu only shows sort options
- Run the targeted Issues page test first.
- Run the full suite after the page change.

