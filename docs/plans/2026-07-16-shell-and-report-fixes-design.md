# Shell And Report Fixes Design

**Date:** 2026-07-16

**Status:** Approved

## Goal

Remove the outer layout gaps from the authenticated app shell and make report submission succeed even when hazard scoring is unavailable.

## User Decisions

- The shell must sit flush against the viewport on the top and right edges.
- The main content pane must stretch fully to the right edge without an empty outer gap.
- Report creation must not be blocked by Gemini scoring failures.

## Problems

### Shell spacing

The authenticated shell currently adds outer `py` and `pr` spacing and constrains the board width with a `max-w` wrapper. That creates visible gaps on the top and right edges and keeps the content pane from filling the available desktop width.

### Report submission

The report flow uploads images first, then calls `/api/score-hazard`, then writes the issue document to Firestore. If scoring fails, the write never happens. In local development this is likely triggered by a missing `GEMINI_API_KEY`.

## Chosen Approach

### Layout

- Remove the outer top and right spacing from `AppShell`
- Let the main shell container use full viewport width
- Keep the existing internal visual structure, borders, sidebar, and mobile behavior

### Reporting

- Keep the scoring endpoint
- Add a server-side fallback score so report creation still proceeds when Gemini is unavailable or returns an error
- Preserve validation errors for truly invalid requests

## Testing Strategy

- Add an `AppShell` regression test for the flush viewport wrapper
- Add `/api/score-hazard` tests for:
  - valid payload returns scorer result
  - scorer failure returns fallback score
  - missing image payload still returns `400`
- Run targeted tests first, then the full test suite

