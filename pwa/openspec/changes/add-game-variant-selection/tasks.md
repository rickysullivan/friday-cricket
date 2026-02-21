## 1. Implementation
- [ ] 1.1 Add variant model and defaults in the game store config (`standard`, `transition`) with backward-compatible fallback behavior.
- [ ] 1.2 Define profile constraints from rule docs (standard: 8-12 players; transition: 6-10 players; both: 16 overs innings) and apply them in setup derivation.
- [ ] 1.3 Update match flow logic and user-facing prompts/labels to derive innings limits from the selected variant profile.
- [ ] 1.4 Ensure Supabase create/join/reconnect/sync paths persist and restore variant-aware state without breaking existing games.

## 2. Validation
- [ ] 2.1 Run `npm run build` to confirm the app compiles with the new variant model.
- [ ] 2.2 Manually verify local scoring for both variants (start match, complete first innings, start second innings, complete match).
- [ ] 2.3 Manually verify Supabase spectator flow for both variants (create game, join as viewer, reconnect session).
