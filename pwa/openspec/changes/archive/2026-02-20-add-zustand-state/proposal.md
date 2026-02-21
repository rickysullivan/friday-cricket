# Change: Add Zustand State Management

## Why
The UI now spans multiple screen components and relies on heavy prop passing, which makes maintenance and future refactors risky. Centralizing app state reduces prop drilling and keeps behavior consistent as components evolve.

## What Changes
- Introduce a Zustand store to hold app-wide state currently passed through props.
- Keep existing hooks where they provide side effects or integrations (e.g., notifications, sync), and sync their outputs into the store.
- Refactor screen components to read state and actions from the store rather than large prop trees.
- Preserve existing behavior and user flows; no functional changes are intended.

## Impact
- Affected specs: state-management (new delta)
- Affected code: `src/main.jsx`, `src/components/screens/*`, `src/hooks/*`, and a new store module under `src/`
- New dependency: Zustand
