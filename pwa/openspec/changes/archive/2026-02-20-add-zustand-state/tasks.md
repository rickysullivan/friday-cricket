## 1. Implementation
- [x] Add Zustand dependency and create a shared store module for app state.
- [x] Define store state shape and actions for game flow, UI modals, and viewer/session status.
- [x] Wire `useGameSync` and `useNotifications` outputs into the store without changing behavior.
- [x] Refactor screen components to consume store selectors and actions instead of prop trees.
- [x] Update `src/main.jsx` to keep only orchestration, effects, and navigation state.

## 2. Verification
- [x] Smoke test core flows: setup, start game, scoring, halftime, complete, share, watch, reconnect.
- [x] Confirm no regression in notification behavior or sync behavior.
