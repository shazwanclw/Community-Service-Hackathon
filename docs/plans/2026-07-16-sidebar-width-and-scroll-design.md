# Sidebar Width And Scroll Design

**Date:** 2026-07-16

**Status:** Approved

## Goal

Make the desktop sidebar wider and keep it fully visible while only the content pane scrolls.

## User Decisions

- The desktop sidebar should be wider horizontally.
- The sidebar should stay fixed in the laptop viewport.
- Scrolling should happen only in the main content pane.
- The points card and logout icon should remain visible without scrolling the sidebar.

## Chosen Approach

- Increase the desktop sidebar width in `AppShell`.
- Convert the shell into a split-pane layout on desktop:
  - left pane: full-height sidebar
  - right pane: independently scrollable content area
- Keep mobile behavior unchanged.

## Testing Strategy

- Extend the `AppShell` test to assert:
  - wider desktop sidebar class
  - independently scrollable desktop content pane
- Run the targeted shell test first.
- Run the full suite after the shell change.

