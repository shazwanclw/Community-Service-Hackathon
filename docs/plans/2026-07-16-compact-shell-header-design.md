# Compact Shell Header Design

**Date:** 2026-07-16

**Status:** Approved

## Goal

Reduce the size and height of the shared page header across all authenticated tabs.

## User Decisions

- The header should be drastically smaller.
- The title font should be smaller.
- The subtitle font should be smaller.
- The overall header block should be much shorter vertically.

## Chosen Approach

- Change the shared header in `components/app-shell.tsx` only.
- Reduce:
  - title font size
  - subtitle font size and line height
  - top and bottom header padding
- Keep the same color treatment, layout structure, and actions placement.

## Testing Strategy

- Extend the existing `AppShell` regression test to assert the compact title and header spacing classes.
- Run the targeted shell test first.
- Run the full suite after the change.

