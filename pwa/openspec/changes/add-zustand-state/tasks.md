## 1. Implementation
- [ ] Add Zustand dependency and create a shared store module for app state.
- [ ] Define store state shape and actions for game flow, UI modals, and viewer/session status.
- [ ] Wire `useGameSync` and `useNotifications` outputs into the store without changing behavior.
- [ ] Refactor screen components to consume store selectors and actions instead of prop trees.
- [ ] Update `src/main.jsx` to keep only orchestration, effects, and navigation state.

## 2. Verification
- [ ] Smoke test core flows: setup, start game, scoring, halftime, complete, share, watch, reconnect.
- [ ] Confirm no regression in notification behavior or sync behavior.
