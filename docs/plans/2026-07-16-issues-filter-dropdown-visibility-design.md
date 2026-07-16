# Issues Filter Dropdown Visibility Design

**Date:** 2026-07-16

**Status:** Approved

## Goal

Make the Issues filter dropdown render in front of the content instead of being clipped behind it.

## Root Cause

The filter dropdown is rendered inside the shared `AppShell` header. That header currently uses `overflow-hidden`, which clips the dropdown when it extends below the header area.

## Chosen Approach

- Change the shared header to allow overflow outside the header bounds.
- Keep the filter dropdown in its current location.
- Raise the header stacking context above the content pane so menus inside the header paint on top.

## Testing Strategy

- Extend the existing `AppShell` test to assert the header no longer uses `overflow-hidden`.
- Run the targeted shell test first.
- Run the full suite after the shell change.

