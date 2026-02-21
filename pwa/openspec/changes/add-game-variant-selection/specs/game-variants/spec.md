## ADDED Requirements
### Requirement: Setup includes game variant selection
The system SHALL allow the scorer to choose a game variant during match setup before starting the game.

#### Scenario: Default variant on setup
- **WHEN** a scorer opens the setup screen for a new match
- **THEN** the setup shows a game variant selector
- **AND** the default selected option is the existing standard format

#### Scenario: Transition variant selected
- **WHEN** a scorer selects Transition Cricket in setup
- **THEN** setup values and summaries update to the Transition Cricket profile
- **AND** the match starts with Transition Cricket metadata in game state

### Requirement: Variant-specific match configuration
The system SHALL apply variant-specific configuration rules to team setup and innings totals.

#### Scenario: Standard variant behavior preserved
- **WHEN** the scorer uses the standard variant
- **THEN** setup enforces the standard Friday Cricket team-size range of 8-12 players
- **AND** each innings total remains 16 overs
- **AND** pair allocation defaults align with a 4-overs-per-pair standard flow

#### Scenario: Transition variant innings totals
- **WHEN** the scorer uses the transition variant
- **THEN** setup enforces the Transition Cricket team-size range of 6-10 players
- **AND** each innings total is set to 16 overs
- **AND** setup presents transition-specific pair allocation guidance for over distribution

#### Scenario: Transition odd-player rotation discretion
- **WHEN** a transition match has an odd player distribution that prevents exact equal rotation
- **THEN** the app shows coach-managed rotation guidance
- **AND** scoring can continue without forcing a strict automatic batting swap pattern

### Requirement: Variant-aware sync and restore
The system SHALL persist and restore the selected game variant across Supabase sync, watcher join, and reconnect flows.

#### Scenario: Umpire creates synced transition game
- **WHEN** an umpire starts a transition match with sync enabled
- **THEN** the synced game state includes transition variant metadata

#### Scenario: Viewer joins transition game
- **WHEN** a viewer joins an active transition match via game ID or watch link
- **THEN** the viewer sees the same variant-specific totals and phase behavior as the umpire

#### Scenario: Legacy game without variant metadata
- **WHEN** the app loads a synced game state that has no explicit variant field
- **THEN** the app treats the game as standard format
- **AND** the session remains playable without errors
