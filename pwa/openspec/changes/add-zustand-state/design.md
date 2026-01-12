# Design: Zustand Store Adoption

## Goals
- Reduce prop drilling across screen components.
- Keep existing hook side effects and integrations intact.
- Avoid behavior changes while improving state access patterns.

## Store Structure
- Create a single store module (e.g., `src/store/useGameStore.js`).
- Store all app-level UI and game state currently passed through props.
- Keep derived values either as selectors or computed in components to avoid stale state.

## Hook Integration
- Keep `useNotifications` and `useGameSync` as the source of side effects.
- Sync hook outputs into the store via setters or actions.
- Avoid storing non-serializable instances in state when practical; if needed (e.g., refs), keep them local to hooks/components.

## Component Integration
- Screen components read state via store selectors.
- Screen components call store actions instead of receiving large prop objects.
- `src/main.jsx` orchestrates hook effects and connects them to the store.

## Non-Goals
- No UI/UX changes.
- No new routing or navigation patterns.
- No rewriting existing hooks unless required for integration.
