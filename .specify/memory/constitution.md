<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 1.0.0 → 1.0.1
Modified Principles: None (principles unchanged)
Clarifications:
  - Updated Target Platforms: Android 11+ → Android 13+ (Expo SDK 54 compatibility)
  - Updated Framework version: Expo SDK 51+ → Expo SDK 54+
  - Clarified storage options: "expo-sqlite or MMKV" → "WatermelonDB (SQLite-based) or MMKV"
Added Sections: None
Removed Sections: None
Templates Requiring Updates:
  ✅ plan-template.md - Already aligned with constitution structure
  ✅ spec-template.md - User Stories structure compatible
  ✅ tasks-template.md - Test-first approach reflected in task generation
  ✅ No command files in templates/ (commands are built-in slash commands)
Follow-up TODOs: None
================================================================================
-->

# Friday Cricket Constitution

## Core Principles

### I. Outdoor-First UX (NON-NEGOTIABLE)

Every UI decision MUST prioritize outdoor usability in bright sunlight. This includes:

- High contrast color schemes (black/white or white on dark navy/green)
- Touch targets ≥56px tall for gloved/sweaty fingers
- Large, bold fonts (≥18pt, semibold) with minimal text
- Manual "Bright Mode" toggle for extreme conditions
- Strong haptic feedback for every user action
- One-handed operation support

**Rationale**: The app replaces paper score sheets used outdoors during cricket matches. If users cannot read or interact with the screen in bright summer afternoons, the app fails its primary purpose. Outdoor usability supersedes visual aesthetics.

### II. Offline-First & Data Reliability

All game data MUST be accessible and modifiable offline with no network dependency:

- Autosave after every scoring event
- Local-first storage (SQLite/MMKV)
- "Saved" toast confirmation for user confidence
- Export/import via JSON, PDF, CSV
- No cloud sync required for MVP

**Rationale**: Cricket matches occur in parks and fields with unreliable connectivity. Data loss is unacceptable when tracking children's games. Every run, wicket, and over must persist immediately.

### III. Rule Enforcement Over Flexibility

The app MUST enforce Friday Cricket rules strictly and prevent invalid game states:

- Block batting pairs exceeding 4 overs
- Warn when bowlers haven't fulfilled minimum 1 over requirement
- Prevent consecutive overs by the same bowler
- Cap innings at 16 overs
- Guide "bad ball → tee free hit" workflow

**Rationale**: The app's value comes from automating rule enforcement that paper scorebooks cannot provide. Rule violations confuse children and undermine fair play. Strict validation prevents disputes.

### IV. Fast Interaction Over Feature Richness

Every user action MUST complete within one or two taps with no loading states:

- Run scoring via keypad grid (0, 1-6 buttons)
- Single-tap wicket and extras (wide, no-ball)
- "Undo" button always visible
- Avoid modals; use slide-in panels
- No multi-step flows for core scoring

**Rationale**: Matches move quickly and scorers must keep pace while watching the game. Complex interactions cause scoring delays, missed events, and user frustration. Speed and simplicity trump comprehensive features.

### V. Test-First Development (NON-NEGOTIABLE)

All implementation follows strict TDD workflow:

1. Write acceptance tests from user stories FIRST
2. Ensure tests FAIL before implementation
3. Implement minimal code to pass tests
4. Refactor with tests green

**Testing Focus**:

- Contract tests for data models and business logic
- Integration tests for rule enforcement algorithms
- Snapshot tests for UI components (outdoor readability verification)
- Manual testing on physical devices in outdoor conditions

**Rationale**: The app handles irreplaceable game data and enforces non-negotiable cricket rules. Bugs in scoring logic, rule validation, or data persistence destroy user trust. Test-first development ensures correctness before code exists.

## Mobile-Specific Constraints

### Platform & Technology

- **Framework**: Expo SDK 54+ (React Native + TypeScript)
- **Router**: Expo Router (file-based navigation)
- **State Management**: React Context (no Redux/MobX complexity)
- **Storage**: WatermelonDB (SQLite-based) or MMKV for persistence
- **UI Components**: Custom components optimized for outdoor visibility (high contrast, large touch targets)
- **Target Platforms**: iOS 15+ and Android 13+ initially

### Performance Standards

- **Cold Start**: <2 seconds to home screen
- **Scoring Response**: <100ms tap-to-feedback latency
- **Data Write**: Autosave complete within 50ms of event
- **Memory**: <150MB peak usage during active game
- **Battery**: <5% drain per hour of active scoring

### Accessibility Requirements

- VoiceOver/TalkBack support for visually impaired users
- Dynamic type support (respect system font size settings)
- Sufficient color contrast (WCAG AA minimum)
- Haptic feedback as alternative to visual-only feedback

## Development Workflow

### Feature Development

1. **Specification**: Write user stories with acceptance criteria in spec.md
2. **Planning**: Define technical approach and task breakdown in plan.md
3. **Test Creation**: Write contract and integration tests (must fail)
4. **Implementation**: Build minimal code to pass tests
5. **Validation**: Manual testing on physical devices in outdoor conditions
6. **Documentation**: Update quickstart.md and relevant docs

### Code Review Gates

- All tests pass (contract, integration, unit where applicable)
- Constitution compliance verified (especially Outdoor-First UX and Rule Enforcement)
- Manual outdoor testing completed for UI changes
- Data persistence validated (autosave confirmation)
- Performance benchmarks met (tap latency, battery usage)

### Testing Tiers

1. **Contract Tests**: Data models, business logic, rule enforcement algorithms
2. **Integration Tests**: User workflows (create game, score runs, export PDF)
3. **Snapshot Tests**: UI component outdoor visibility (high contrast verification)
4. **Manual Tests**: Physical device testing in outdoor lighting conditions

## Governance

### Amendment Procedure

1. Propose change with rationale and impacted principles
2. Document why current constitution is inadequate
3. Update constitution version (semantic versioning)
4. Propagate changes to all templates (plan, spec, tasks)
5. Update LAST_AMENDED_DATE to change date

### Versioning Policy

- **MAJOR** (X.0.0): Backward incompatible governance changes, principle removal/redefinition
- **MINOR** (0.X.0): New principles added, material expansions to guidance
- **PATCH** (0.0.X): Clarifications, wording fixes, non-semantic refinements

### Compliance Review

- Every feature spec MUST reference relevant principles
- Every implementation plan MUST include "Constitution Check" section
- Code reviews MUST verify principle adherence (especially NON-NEGOTIABLE items)
- Violations require explicit justification in "Complexity Tracking" section of plan.md

### Constitution Authority

This constitution supersedes all other practices, preferences, and prior decisions. When conflicts arise, constitution principles take precedence. Complexity and violations must be justified with documented rationale showing why simpler constitutional approaches were insufficient.

**Version**: 1.0.1 | **Ratified**: 2025-11-07 | **Last Amended**: 2025-11-08
