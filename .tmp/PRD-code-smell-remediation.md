# PRD: Code Smell Remediation & Test Foundation

## Problem Statement

The Color Palettes codebase has accumulated code smells across its core `src/lib/` modules that reduce maintainability, create subtle bugs, and make refactoring risky. These include mutable parameter mutation, duplicated types, a missing production dependency (`zod`), unvalidated data flowing from localStorage, duplicated validation logic, and silently swallowed errors. Until now, the project had zero tests — no safety net for any refactoring.

## Solution

Fix the identified code smells across `src/lib/` and `src/app/actions/` while leveraging the 79 tests already in place as a regression safety net. Extract shared validation logic into a single module, consolidate duplicated types, install the missing `zod` dependency, add defensive validation at system boundaries (localStorage, URL parsing), and surface silently swallowed errors to the user. The existing test suite locks in correct external behavior, so every fix can be verified against passing tests.

## User Stories

1. As a developer, I want `smartMapToPalette` to not mutate its input array, so that I can trust that calling it won't cause unexpected side effects in callers.
2. As a developer, I want a single `SavedPalette` type shared across the codebase, so that I don't have to maintain two identical interfaces that can drift apart.
3. As a developer, I want `zod` listed in `package.json` dependencies, so that the server action in `generate-palette.ts` doesn't crash in production.
4. As a developer, I want `loadSavedPalettes` to validate individual palette entries, so that corrupted localStorage data doesn't propagate as broken palette objects through the UI.
5. As a developer, I want the hex validation regex defined in one place, so that I don't have three copies that can fall out of sync.
6. As a user, I want to see an error message when image extraction fails, so that I know something went wrong instead of the UI silently doing nothing.
7. As a developer, I want `generateHarmony` and `decodePaletteFromUrl` to build palette objects safely without `as Palette` casts, so that TypeScript catches missing roles at compile time.
8. As a developer, I want magic numbers in harmony generation replaced with named constants, so that I can understand what each value represents without reading the math.
9. As a developer, I want the surface-text contrast check to account for palette brightness, so that dark palettes don't incorrectly test black text against a dark surface.
10. As a developer, I want contrast badge labels derived from the pairing data rather than hardcoded indices, so that reordering `getPaletteContrasts` doesn't silently break the UI.
11. As a developer, I want the unused `role` prop removed from `ColorPicker`, so that the component interface is clean and the TypeScript compiler doesn't have dead parameters.
12. As a developer, I want the shared `SheetTrigger` style extracted to a reusable component or class, so that I can update button styling in one place instead of three.
13. As a developer, I want the URL sync `useEffect` to skip the initial render when the palette was just loaded from the URL, so that `history.replaceState` isn't called redundantly on mount.
14. As a developer, I want all 79 existing tests to continue passing after every smell fix, so that I have confidence the refactors didn't break external behavior.
15. As a developer, I want new tests added for the extracted validation module, so that shared validation logic has its own regression safety net.
16. As a developer, I want tests for the consolidated `loadSavedPalettes` validation, so that corrupted entries (missing fields, wrong types) are confirmed to be filtered out.
17. As a developer, I want the `StoredPalette` type eliminated and all imports updated to `SavedPalette`, so that there is one canonical type for saved palette entries.
18. As a developer, I want `smartMapToPalette` to work on a copy of the input array internally, so that the mutation smell is fixed without changing the function signature.
19. As a developer, I want named constants like `SATURATION_BOOST`, `LIGHTNESS_MAX`, `BG_LIGHTNESS`, `BG_SATURATION`, `SURFACE_LIGHTNESS`, and `SURFACE_SATURATION` in harmony generation, so that the color math is self-documenting.
20. As a developer, I want the contrast checking function to determine appropriate text color (black or white) based on surface lightness, so that contrast badges are accurate for both light and dark palettes.

## Implementation Decisions

- **Extract `src/lib/validators.ts`** — a new module containing the shared hex validation regex (`isValidHex` currently in `color.ts`) and a new `isValidPaletteEntry` function for localStorage validation. `color.ts` re-exports `isValidHex` from this module for backward compatibility.
- **Consolidate types** — remove `StoredPalette` from `palette-storage.ts`, import `SavedPalette` from `types.ts` instead. All files that referenced `StoredPalette` update to `SavedPalette`.
- **Install `zod`** — add to `package.json` dependencies. The server action in `generate-palette.ts` already imports it; it just wasn't declared. This is a build-breaking bug.
- **Immutable `smartMapToPalette`** — copy the input array at the top of the function (`const colors = [...inputColors]`) before the padding while-loop. Function signature unchanged. Existing test includes a regression guard.
- **Safe palette construction** — replace `Partial<Palette>` + `as Palette` pattern in `generateHarmony` and `decodePaletteFromUrl` with explicit object literals `{ primary: ..., secondary: ..., accent: ..., background: ..., surface: ... }`. TypeScript will verify completeness at compile time.
- **Named harmony constants** — extract magic numbers into `const` declarations at module scope in `color.ts`: e.g. `IDENTITY_SATURATION_BOOST = 1.2`, `MONO_LIGHTNESS_FACTOR = 1.3`, `BG_SATURATION = 0.05`, `BG_LIGHTNESS = 0.97`, `SURFACE_SATURATION = 0.08`, `SURFACE_LIGHTNESS = 0.93`.
- **Adaptive contrast text color** — in `getPaletteContrasts`, derive the surface-text foreground by checking surface lightness: if lightness > 0.5 use `#000000`, else use `#FFFFFF`. Uses the same `chroma` already imported.
- **Data-driven contrast labels** — return a `label` field from `getPaletteContrasts` alongside `foreground`, `background`, `ratio`, `level`. `contrast-badges.tsx` reads `info.label` instead of indexing `PAIR_LABELS[i]`.
- **Remove unused `role` prop** — `ColorPicker` currently accepts `role` but never reads it. Remove from the interface and the destructured props. Update `color-slot.tsx` to not pass `role` to `ColorPicker`.
- **Extract `PanelTrigger` component** — shared button styled as a `SheetTrigger` used by export, extract, and history panels. Replaces three identical className strings.
- **Guard initial URL sync** — in `use-palette.tsx`, use a ref to track whether the initial load came from URL params; skip the URL-replace `useEffect` on first render if so.
- **Surface extraction errors** — in `extract-panel.tsx`, set an error state in the catch block and display it below the upload button. Clear it when a new file is selected.
- **Validate localStorage entries** — `loadSavedPalettes` filters each entry through a runtime check: must have `id` (string), `colors` (object with all 5 palette roles as valid hex strings), `createdAt` (number). Invalid entries are silently dropped.

## Testing Decisions

- **Good test criteria** — tests assert external behavior (inputs → outputs), not implementation details. Tests should pass regardless of internal refactoring. No tests probe private variables, internal state, or module-scoped constants.
- **Modules tested (existing seams)**:
  - `src/lib/color.ts` — 36 tests covering harmony generation, contrast checking, hex validation, HSL conversion, smart mapping. Includes a regression guard for the array mutation smell.
  - `src/lib/url-encoding.ts` — 14 tests covering encode, decode, round-trip, edge cases (missing params, wrong segment count, invalid hex).
  - `src/lib/export-formats.ts` — 18 tests covering all 4 export formats, file extensions, filenames.
  - `src/lib/palette-storage.ts` — 11 tests with mocked localStorage covering save, load, delete, max-limit enforcement, malformed data handling.
- **Modules tested (new seams)**:
  - `src/lib/validators.ts` — new test file covering `isValidHex` (same cases migrated from `color.test.ts`) and `isValidPaletteEntry` (valid entry, missing fields, invalid hex in colors, wrong types).
  - `palette-storage.test.ts` — extend existing tests to verify that corrupted entries (e.g., a saved palette missing the `accent` role) are filtered out by the updated `loadSavedPalettes`.
- **Prior art** — the 79 tests already written establish the pattern: `describe`/`it` blocks via Vitest, `expect` assertions, mocked browser APIs via `vi.fn()` for `localStorage`. New tests follow the same conventions.

## Out of Scope

- React component tests (ColorPicker, panels, navbar) — these are UI-layer concerns, not the smell fixes. Could be added later with React Testing Library.
- Visual regression or E2E tests — out of scope for a code smell PRD.
- Refactoring the AI mood generation server action beyond fixing the `zod` dependency — the action's retry logic and prompt engineering are functional, just needs the dep.
- Adding new features — this PRD is purely remediation. No new user-facing capabilities.
- Dark mode contrast testing — the adaptive text-color fix addresses the hardcoded `#000000`, but comprehensive dark-palette testing is a follow-up.
- Performance optimization — the code smells are maintainability/correctness issues, not performance bottlenecks.

## Further Notes

- The 79 existing tests were written before this PRD as a prerequisite safety net. Every smell fix should be verified against these tests passing green.
- The code smells were identified via a full codebase read. The severity ranking (🔴 High / 🟡 Medium / 🟢 Low) reflects potential for runtime bugs, not just style preferences.
- ADR-0001 (Gemini API for AI mood generation) is unaffected by these changes — the server action's interface and graceful degradation pattern remain the same.
- The `zod` missing dependency is the highest-priority fix because it will cause a runtime crash in the AI mood generation feature when deployed.
- The `smartMapToPalette` mutation smell has a regression test already in place — the test verifies the input array is unchanged after calling the function.
