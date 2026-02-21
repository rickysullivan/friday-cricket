## Context
The current flow has one setup model: team player counts, derived pairs, and configurable overs per pair. Match logic, notifications, and spectator sync all depend on this shared config shape. The Transition Cricket rules introduce a second format with different setup constraints and fixed innings length expectations.

Key transition rule inputs from `docs/Friday night transition cricket rules.pdf`:
- Team size target is 6-10 players.
- Matches are 16 overs per team.
- Batters remain in pairs and rotate by overs allocation.

Cross-check with `docs/Friday night cricket.docx` shows the standard Friday profile should be treated as a distinct ruleset:
- Team size target is 8-12 players.
- Matches are also 16 overs per team.
- Batters are in pairs with up to 4 overs per pair.

## Goals / Non-Goals
- Goals:
  - Allow scorer to select game variant before starting a match.
  - Ensure setup math and in-game totals adapt to selected variant.
  - Keep Supabase sync and watcher views consistent across both variants.
  - Preserve existing standard match behavior as the default.
- Non-Goals:
  - Rebuild ball-by-ball scoring model or add run scoring.
  - Add administrative tooling for creating new variants beyond the two requested formats.
  - Change Supabase table structure unless required for compatibility.

## Decisions
- Decision: Add a `gameVariant` field to the store config and synced game state.
  - Why: Variant awareness must survive reload, reconnect, and watch mode.
  - Alternatives considered:
    - Infer variant from numeric config only: fragile and ambiguous.
    - Store variant only in UI component state: breaks sync/reconnect.

- Decision: Represent setup behavior through lightweight variant profiles.
  - Why: Existing logic already centers on config derivation; profile constraints allow minimal change while keeping behavior explicit.
  - Alternatives considered:
    - Fork separate setup/game screens per variant: higher maintenance and drift risk.
    - Hard-code transition conditions inline across handlers: brittle and difficult to test.

- Decision: For odd transition team sizes, the app provides rotation guidance and coach-managed discretion rather than strict automated enforcement.
  - Why: Club guidance confirms coach decides at game time who stays in or switches.

- Decision: Keep the existing Supabase `state` JSON model and add variant metadata inside it.
  - Why: No table migration is required because `games.state` already stores the full serialized match state.
  - Alternatives considered:
    - Add top-level `variant` DB column: queryable but unnecessary for current flow.

- Decision: Use backward-compatible fallback when loading legacy game state.
  - Why: Existing active or archived games may lack `config.gameVariant`.
  - Fallback: Missing variant is treated as `standard`.

## Risks / Trade-offs
- Risk: Transition rules mention overs split evenly by players, which can conflict with odd team sizes.
  - Mitigation: Document transition setup constraints in UI copy and enforce profile-specific limits in setup controls.

- Risk: Existing app defaults (4-16 players and variable overs-per-pair control) differ from club standard and transition rules.
  - Mitigation: Move range and overs defaults into variant profiles and use variant-specific limits.

- Risk: Mixed-version clients (old and new app versions) may sync states with different config shapes.
  - Mitigation: Make variant additive with safe defaults; avoid removing existing config keys.

## Migration Plan
1. Ship variant-aware state with default `standard` when missing.
2. Update setup UI to expose variant selection and profile-specific constraints.
3. Update game flow messaging to use profile-derived innings totals.
4. Validate umpire-create, viewer-join, and reconnect for both variants.

Rollback path:
- Revert to single-variant UI while keeping additive `gameVariant` field ignored by old logic.

## Open Questions
- None currently.
