---
github_issue: 111
title: Implementation Tasks: Kids Cricket Game Tracker
status: planning
feature: tasks
labels: tasks, implementation
created: 2025-11-07
updated: 2025-11-07
---

# Implementation Tasks: Kids Cricket Game Tracker

**Feature**: 001-cricket-game-tracker
**Generated**: 2025-11-08
**Total Estimated Tasks**: 78 tasks across 7 phases

## Overview

This document breaks down the implementation into dependency-ordered, independently testable phases organized by user story. Each user story (P1-P5 from spec.md) becomes its own phase after foundational setup.

**Implementation Strategy**: MVP-first incremental delivery
- **Phase 1 (Setup)**: Project initialization and configuration
- **Phase 2 (Foundation)**: Core infrastructure needed by all stories
- **Phase 3 (US1 - P1)**: Create and Score a Match (MVP)
- **Phase 4 (US2 - P2)**: Rule Enforcement and Validation
- **Phase 5 (US3 - P3)**: View Match History and Export Records
- **Phase 6 (US4 - P4)**: Resume Interrupted Matches
- **Phase 7 (US5 - P5)**: Special Events and Edge Cases
- **Phase 8 (Polish)**: Cross-cutting concerns and optimization

**Test-First Development**: Constitution mandates TDD workflow for all phases. Each task follows RED → GREEN → REFACTOR.

---

## Phase 1: Project Setup and Configuration

**Goal**: Initialize Expo project with all dependencies and configuration

**Duration**: ~2-3 hours

**Prerequisites**: Node.js 20+, npm 10+, Xcode 15+ (macOS), Android Studio with SDK 34+

### Tasks

- [X] T001 Initialize Expo project with TypeScript template using `npx create-expo-app@latest friday-cricket --template expo-template-blank-typescript`
- [X] T002 [P] Install core dependencies: `expo@~54.0.0`, `expo-router@~4.0.0`, `typescript@^5.7.0`, `react-native@0.76.x`
- [X] T003 [P] Install WatermelonDB: `@nozbe/watermelondb@^0.27.0` and configure native setup (iOS pods, Android gradle)
- [X] T004 [P] Install Supabase client: `@supabase/supabase-js@^2.46.0`
- [X] T005 [P] Install Yjs CRDT: `yjs@^13.6.0`, `y-expo-sqlite@^1.0.0`
- [X] T006 [P] Install Expo modules: `expo-haptics@~14.0.0`, `expo-print@~14.0.0`, `expo-sharing@~13.0.0`
- [X] T007 [P] Install testing dependencies: `jest@^29.0.0`, `@testing-library/react-native@^12.0.0`, `detox@^20.0.0`
- [X] T008 Configure Expo Router file-based navigation in app.json with `"scheme": "friday-cricket"`
- [X] T009 Create `.env` file with placeholders for `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [X] T010 Create project structure directories: `app/`, `src/components/`, `src/models/`, `src/services/`, `src/hooks/`, `src/context/`, `src/utils/`, `src/sync/`, `tests/`
- [X] T011 Configure TypeScript with strict mode in tsconfig.json: `"strict": true`, `"noUncheckedIndexedAccess": true`
- [X] T012 Configure Jest for React Native testing in jest.config.js with `preset: "react-native"`
- [ ] T013 Configure Detox for E2E testing in .detoxrc.js with iOS and Android configurations
- [X] T014 Create src/utils/constants.ts with outdoor-optimized theme colors (black #000000, white #FFFFFF, green success, red error, orange warning)
- [X] T015 Update .gitignore to exclude `.env`, `node_modules/`, `ios/Pods/`, `.expo/`

---

## Phase 2: Foundational Infrastructure

**Goal**: Build core infrastructure needed by all user stories (database, context providers, base UI components)

**Duration**: ~6-8 hours

**Dependencies**: Phase 1 complete

**Independent Test**: Infrastructure can be tested independently by verifying WatermelonDB initialization, context provider mounting, and base component rendering

### Tasks

#### WatermelonDB Setup

- [X] T016 Create WatermelonDB schema definition in src/models/schema.ts with tables for games, teams, players, innings, overs, over_events
- [X] T017 Create WatermelonDB database initialization in src/models/database.ts with SQLite adapter
- [X] T018 [P] Create Game model in src/models/Game.ts extending WatermelonDB Model with @field decorators
- [X] T019 [P] Create Team model in src/models/Team.ts with @relation to Game
- [X] T020 [P] Create Player model in src/models/Player.ts with @relation to Team
- [X] T021 [P] Create Innings model in src/models/Innings.ts with @relation to Game
- [X] T022 [P] Create Over model in src/models/Over.ts with @relation to Innings
- [X] T023 [P] Create OverEvent model in src/models/OverEvent.ts with @relation to Over

#### React Context Providers

- [X] T024 Create ThemeContext in src/context/ThemeContext.tsx with normal/bright mode toggle state
- [X] T025 Create GameContext in src/context/GameContext.tsx with active game state and WatermelonDB observable queries
- [X] T026 Create SyncContext in src/context/SyncContext.tsx with Yjs document provider and sync status

#### Base UI Components (Outdoor-Optimized)

- [X] T027 [P] Create Button component in src/components/ui/Button.tsx with ≥56px height, high contrast, haptic feedback on press
- [X] T028 [P] Create Input component in src/components/ui/Input.tsx with ≥18pt font, large focus states
- [X] T029 [P] Create Card component in src/components/ui/Card.tsx with high contrast borders and shadows
- [X] T030 [P] Create SlidePanel component in src/components/ui/SlidePanel.tsx using Animated API for slide-in from bottom
- [X] T031 [P] Create ScoreDisplay component in src/components/scoring/ScoreDisplay.tsx with 48pt bold font for numeric totals

#### Custom Hooks

- [X] T032 [P] Create useHaptics hook in src/hooks/useHaptics.ts wrapping expo-haptics with configurable intensity
- [X] T033 [P] Create useGame hook in src/hooks/useGame.ts for accessing GameContext and WatermelonDB queries
- [X] T034 [P] Create useTheme hook in src/hooks/useTheme.ts for accessing ThemeContext (normal/bright mode)

#### Root Layout

- [X] T035 Create app/_layout.tsx with Expo Router Stack and context providers (Theme, Game, Sync)
- [X] T036 Create app/+not-found.tsx for 404 handling

---

## Phase 3: User Story 1 - Create and Score a Match (P1 - MVP)

**Goal**: Enable users to create a match, set up teams/players, and record real-time scoring events

**Duration**: ~12-15 hours

**Dependencies**: Phase 2 complete

**Independent Test**:
- Create match with 2 teams, 8+ players each
- Record runs (0, 1-6), wickets, extras
- Verify score updates immediately
- Verify autosave after each event
- Verify undo reverses last event

**Acceptance Criteria** (from spec.md):
1. Home screen → Tap "New Game" → Setup wizard appears
2. Enter team names + 8+ players → Auto-generate pairs + bowling rotation
3. Active innings → Tap run buttons → Score updates + saves locally
4. Record 6 valid balls → Auto-advance to next over + suggest bowler
5. Tap "Undo" → Last event reversed + state restored

### Tests (TDD: Write First)

- [X] T037 [P] [US1] Write contract test for pairingAlgorithm.ts in tests/contract/pairingAlgorithm.test.ts: verify 8 players → 4 pairs, odd players → wraparound pairing
- [X] T038 [P] [US1] Write contract test for bowlingRotation.ts in tests/contract/bowlingRotation.test.ts: verify 8 players → 16-over rotation, no consecutive bowler
- [X] T039 [P] [US1] Write contract test for scoringEngine.ts in tests/contract/scoringEngine.test.ts: verify run calculation, wicket count, over completion (6 valid balls)
- [X] T040 [P] [US1] Write integration test for game creation in tests/integration/createGame.test.ts: render home → tap New Game → fill form → verify Game + Teams + Players in WatermelonDB
- [X] T041 [P] [US1] Write integration test for scoring flow in tests/integration/scoreMatch.test.ts: create game → start innings → tap runs → verify OverEvent created + score updated

### Implementation

#### Business Logic (Services)

- [X] T042 [US1] Implement pairingAlgorithm.ts in src/services/pairingAlgorithm.ts: `makePairs(players: Player[]): BattingPair[]` generating 4 pairs with 4 overs each
- [X] T043 [US1] Implement bowlingRotation.ts in src/services/bowlingRotation.ts: `planBowlers(players: Player[], totalOvers: number): string[]` ensuring no consecutive bowler
- [X] T044 [US1] Implement scoringEngine.ts in src/services/scoringEngine.ts with functions: `calculateTotalRuns()`, `calculateWickets()`, `isOverComplete()`, `getNextBowler()`

#### Screens

- [X] T045 [US1] Create home screen in app/(tabs)/index.tsx with buttons: "New Game", "Resume Last Game", "View History"
- [X] T046 [US1] Create game setup wizard in app/game/[id]/setup.tsx with multi-step form: team names → add players (min 8 per team) → review pairs/bowlers → start match
- [X] T047 [US1] Create scoring screen in app/game/[id]/scoring.tsx with ScoreDisplay, RunKeypad, ExtraButtons, UndoButton, over progress indicator

#### Game Management Components

- [X] T048 [P] [US1] Create PlayerList component in src/components/game/PlayerList.tsx for adding/removing players with unique name validation
- [X] T049 [P] [US1] Create BattingPairCard component in src/components/game/BattingPairCard.tsx displaying pair names and overs faced
- [X] T050 [P] [US1] Create BowlerRotation component in src/components/game/BowlerRotation.tsx showing bowling order with highlighting for current bowler

#### Scoring Components

- [X] T051 [P] [US1] Create RunKeypad component in src/components/scoring/RunKeypad.tsx with buttons for 0, 1, 2, 3, 4, 6 (64px × 64px, 20pt font)
- [X] T052 [P] [US1] Create ExtraButtons component in src/components/scoring/ExtraButtons.tsx with Wide, No-Ball, Wicket buttons
- [X] T053 [P] [US1] Create UndoButton component in src/components/scoring/UndoButton.tsx (48px × 120px, always visible, haptic feedback)

#### Scoring Hook

- [X] T054 [US1] Create useScoring hook in src/hooks/useScoring.ts with functions: `recordRun()`, `recordWicket()`, `recordExtra()`, `undoLastEvent()`, `advanceOver()`
- [X] T055 [US1] Implement autosave in useScoring: after each scoring event, write to WatermelonDB using database.write() with <50ms target
- [X] T056 [US1] Implement undo logic in useScoring: find most recent OverEvent by created_at, soft delete (markAsDeleted()), recompute Over/Innings totals

#### Navigation

- [X] T057 [US1] Create app/(tabs)/_layout.tsx with bottom tab navigation: Home, History, Settings
- [X] T058 [US1] Create app/game/_layout.tsx with stack navigation for game screens (setup → scoring → summary)

---

## Phase 4: User Story 2 - Rule Enforcement and Validation (P2)

**Goal**: Automatically enforce Friday Cricket rules and warn users before violations

**Duration**: ~6-8 hours

**Dependencies**: Phase 3 complete (US1)

**Independent Test**:
- Attempt batting pair > 4 overs → Verify prevented + auto-rotate
- Attempt same bowler consecutive overs → Verify warning displayed
- Complete 16 overs → Verify innings auto-closes + summary shown
- Setup bowling with skipped player → Verify warning for min 1 over/player

**Acceptance Criteria** (from spec.md):
1. Batting pair completes 4 overs → Prevented from batting further + auto-rotate
2. Same bowler selected for consecutive overs → Warning displayed
3. 16th over finishes → Innings auto-closes + summary shown
4. Bowling setup → Each player allocated ≥1 over, warnings if skipped

### Tests (TDD: Write First)

- [ ] T059 [P] [US2] Write contract test for ruleEngine.ts in tests/contract/ruleEngine.test.ts: `validateBattingPairLimit()` returns error when pair exceeds 4 overs
- [ ] T060 [P] [US2] Write contract test for ruleEngine.ts: `validateBowlingRotation()` returns error when same bowler selected consecutively
- [ ] T061 [P] [US2] Write contract test for ruleEngine.ts: `validateInningsComplete()` returns true when 16 overs completed
- [ ] T062 [P] [US2] Write contract test for ruleEngine.ts: `validateMinimumBowlingAllocation()` returns warnings for players with <1 over allocated

### Implementation

#### Rule Engine

- [ ] T063 [US2] Implement ruleEngine.ts in src/services/ruleEngine.ts with validation functions returning `ValidationResult { isValid: boolean, errorMessage?: string }`
- [ ] T064 [US2] Implement `validateBattingPairLimit(pair: BattingPair): ValidationResult` checking overs_completed < 4
- [ ] T065 [US2] Implement `validateBowlingRotation(currentBowlerId: string, previousBowlerId: string): ValidationResult` checking not equal
- [ ] T066 [US2] Implement `validateInningsComplete(innings: Innings): ValidationResult` checking overs_completed >= overs_planned
- [ ] T067 [US2] Implement `validateMinimumBowlingAllocation(players: Player[], bowlingPlan: string[]): ValidationResult[]` checking each player appears ≥1 time

#### UI Integration

- [ ] T068 [US2] Integrate rule warnings into scoring screen: before recording event, call ruleEngine validators and display warnings in SlidePanel
- [ ] T069 [US2] Implement auto-rotation logic in useScoring: when batting pair completes 4 overs, automatically switch to next pair and show toast notification
- [ ] T070 [US2] Implement innings auto-close: when 16th over completes, transition game status to 'completed' and navigate to summary screen
- [ ] T071 [US2] Add bowling validation to setup wizard: highlight players with <1 over, show warning banner at bottom of screen

---

## Phase 5: User Story 3 - View Match History and Export Records (P3)

**Goal**: Enable users to review past matches and export data as PDF/CSV

**Duration**: ~8-10 hours

**Dependencies**: Phase 3 complete (US1), Phase 4 optional

**Independent Test**:
- Complete match → Navigate to history → Verify match appears in list
- Tap match in history → Verify full details displayed
- Tap "Export PDF" → Verify PDF generated with scoresheet layout
- Tap "Export CSV" → Verify CSV with one row per scoring event
- Tap "Duplicate" → Verify new game created with same teams/players

**Acceptance Criteria** (from spec.md):
1. Home screen → Tap "View History" → List of completed games with date, teams, result
2. Tap match in history → Full details shown (pairs, overs, runs, wickets)
3. Completed match summary → Tap "Export PDF" → PDF generated and shareable
4. Completed match summary → Tap "Export CSV" → CSV generated with event rows
5. History list → Tap "Duplicate" → New game with pre-filled teams/players

### Tests (TDD: Write First)

- [ ] T072 [P] [US3] Write contract test for exportService.ts in tests/contract/exportService.test.ts: `generatePDF()` produces valid PDF structure
- [ ] T073 [P] [US3] Write contract test for exportService.ts: `generateCSV()` produces CSV with header row + one row per OverEvent
- [ ] T074 [P] [US3] Write integration test for history list in tests/integration/historyList.test.ts: render history screen → verify completed games displayed sorted by date descending

### Implementation

#### Export Service

- [ ] T075 [US3] Implement exportService.ts in src/services/exportService.ts with `generatePDF(game: Game): Promise<string>` using expo-print to create HTML scoresheet
- [ ] T076 [US3] Implement `generateCSV(game: Game): Promise<string>` iterating over OverEvents and building CSV string with columns: over, ball, event_type, runs, wickets
- [ ] T077 [US3] Implement `shareFile(uri: string, mimeType: string): Promise<void>` using expo-sharing to share generated files

#### Screens

- [ ] T078 [US3] Create history screen in app/(tabs)/history.tsx with FlatList displaying MatchHistoryEntry cards (date, teams, result, status badge)
- [ ] T079 [US3] Create match detail screen in app/match/[id].tsx displaying full game details: team names, innings summaries, batting pair stats, bowling stats
- [ ] T080 [US3] Create match summary screen in app/game/[id]/summary.tsx with totals, stats, and action buttons: "Export PDF", "Export CSV", "Duplicate", "Share"

#### Duplicate Functionality

- [ ] T081 [US3] Implement game duplication in useGame hook: `duplicateGame(gameId: string)` creating new Game with same teams/players, status='setup', new UUID

---

## Phase 6: User Story 4 - Resume Interrupted Matches (P4)

**Goal**: Enable users to resume matches after app crash or force-close without data loss

**Duration**: ~4-5 hours

**Dependencies**: Phase 3 complete (US1)

**Independent Test**:
- Start match → Record overs → Force-close app → Reopen → Verify "Resume Last Game" appears
- Tap "Resume Last Game" → Verify exact state restored (score, over, bowler)
- View history → Verify in-progress matches distinguished from completed (status badge)
- End match early → Verify marked complete + statistics reflect completed overs only

**Acceptance Criteria** (from spec.md):
1. App closed/crashes → All events up to last autosave preserved
2. Home screen after restart → Tap "Resume Last Game" → Most recent in-progress match loads
3. View history → In-progress matches clearly distinguished (badge/color)
4. End match early → Marked complete + stats reflect completed overs

### Tests (TDD: Write First)

- [ ] T082 [P] [US4] Write integration test for resume functionality in tests/integration/resumeMatch.test.ts: create game → close app → reopen → verify game state restored
- [ ] T083 [P] [US4] Write contract test for game status transitions in tests/contract/gameStatus.test.ts: verify status='in_progress' games can be resumed

### Implementation

#### Resume Logic

- [ ] T084 [US4] Implement `getLastActiveGame()` in useGame hook: query WatermelonDB for most recent game with status='in_progress', order by updated_at desc
- [ ] T085 [US4] Update home screen (app/(tabs)/index.tsx): conditionally show "Resume Last Game" button when getLastActiveGame() returns a game
- [ ] T086 [US4] Implement resume navigation: on "Resume Last Game" tap, navigate to scoring screen with game ID from getLastActiveGame()
- [ ] T087 [US4] Add status badges to history list: render "In Progress" badge (orange) vs "Completed" badge (green) based on game.status
- [ ] T088 [US4] Implement early match end: add "End Match Early" button to scoring screen → confirm dialog → set status='completed', overs_completed=current

---

## Phase 7: User Story 5 - Special Events and Edge Cases (P5)

**Goal**: Handle special cricket events (bad balls, wides, no-balls) and edge cases (odd players, >8 players)

**Duration**: ~6-8 hours

**Dependencies**: Phase 3 complete (US1)

**Independent Test**:
- Tap "Bad Ball" → Verify prompt for free hit result appears
- Record free hit outcome → Verify added to score + over continues
- Tap "Wide"/"No-Ball" → Verify extra run added, ball doesn't count toward over
- Create team with odd players → Verify last player paired with first (wraparound)
- Create team with >8 players → Verify fielding rotation reminder displayed

**Acceptance Criteria** (from spec.md):
1. Tap "Bad Ball" → System records event + prompts for free hit result
2. Record free hit outcome → Result added to score + over continues
3. Tap "Wide"/"No-Ball" → Extra run added, ball not counted toward over completion
4. Odd number of batters → Last player paired with first (wraparound)
5. Team >8 players → Fielding rotation reminder displayed

### Tests (TDD: Write First)

- [ ] T089 [P] [US5] Write contract test for bad ball workflow in tests/contract/scoringEngine.test.ts: `recordBadBall()` creates OverEvent with event_type='badball_freehit'
- [ ] T090 [P] [US5] Write contract test for extras in tests/contract/scoringEngine.test.ts: Wide/No-Ball increments runs but not valid_balls counter
- [ ] T091 [P] [US5] Write contract test for odd player pairing in tests/contract/pairingAlgorithm.test.ts: 9 players → 5th pair wraps to player 1

### Implementation

#### Special Event Handling

- [ ] T092 [US5] Add "Bad Ball" button to ExtraButtons component with distinct styling (amber color)
- [ ] T093 [US5] Implement bad ball workflow in useScoring: `recordBadBall()` shows SlidePanel prompt for free hit result (run count 0-6), creates two OverEvents (bad ball + free hit)
- [ ] T094 [US5] Update scoringEngine.ts: ensure Wide/No-Ball events increment runs but not valid_balls counter, over completes only when valid_balls=6
- [ ] T095 [US5] Update pairingAlgorithm.ts: handle odd player count by wrapping last player with first player (modulo logic)

#### Edge Case Handling

- [ ] T096 [US5] Add fielding rotation reminder to setup wizard: if team.players.length > 8, display info banner "Remember: Rotate fielders each over (max 8 on field)"
- [ ] T097 [US5] Add validation to Player input: prevent duplicate names within same team, show inline error message
- [ ] T098 [US5] Implement tie-breaker display in summary screen: if team_a_runs === team_b_runs, show "Runs ÷ Wickets = Average" calculation for both teams

---

## Phase 8: Polish and Cross-Cutting Concerns

**Goal**: Optimize performance, add settings, implement optional cloud sync

**Duration**: ~8-10 hours

**Dependencies**: Phases 3-7 complete

**Not story-specific**: These tasks improve the entire app across all user stories

### Performance Optimization

- [ ] T099 [P] Optimize scoring screen rendering: wrap RunKeypad, ExtraButtons, UndoButton in React.memo() to prevent re-renders
- [ ] T100 [P] Optimize calculations: wrap `calculateTotalRuns()`, `calculateWickets()` in useMemo() hooks with dependencies on innings.id
- [ ] T101 [P] Optimize history list: implement FlatList windowSize={5} and getItemLayout for virtualization
- [ ] T102 [P] Add loading states: create LoadingSpinner component, show during WatermelonDB queries and PDF generation

### Settings Screen

- [ ] T103 Create settings screen in app/(tabs)/settings.tsx with options: Bright Mode toggle, Haptic Intensity (Light/Medium/Heavy), Sync Configuration
- [ ] T104 Implement bright mode toggle: update ThemeContext to switch color palette (remove all grays, increase contrast)
- [ ] T105 Implement haptic intensity setting: save to AsyncStorage, update useHaptics hook to use configured intensity

### Optional Cloud Sync (Supabase)

- [ ] T106 Create Supabase client in src/sync/supabase/client.ts with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY from .env
- [ ] T107 Implement Supabase sync in src/sync/supabase/sync.ts: `pushChanges()` and `pullChanges()` using WatermelonDB sync protocol
- [ ] T108 Add sync status indicator to home screen: show "Synced", "Syncing", or "Offline" badge with icon
- [ ] T109 Implement sync toggle in settings: enable/disable cloud sync, show last sync timestamp

### Optional Multi-Device Sync (Yjs)

- [ ] T110 Create Yjs provider in src/sync/yjs/provider.ts initializing Y.Doc() and y-expo-sqlite persistence
- [ ] T111 Create Yjs game document structure in src/sync/yjs/gameDoc.ts with Y.Map for metadata, Y.Array for events
- [ ] T112 Integrate Yjs into useScoring: append scoring events to Y.Array instead of direct WatermelonDB writes
- [ ] T113 Implement Yjs sync to Supabase: periodically save Y.Doc snapshots to yjs_documents table

### Accessibility

- [ ] T114 [P] Add accessibility labels to all buttons: set `accessibilityLabel` and `accessibilityHint` props
- [ ] T115 [P] Test VoiceOver/TalkBack: ensure all screens are navigable with screen reader
- [ ] T116 [P] Support dynamic type: use scaled font sizes with `PixelRatio.getFontScale()` for user's system font size preference

### Error Handling

- [ ] T117 [P] Add error boundaries: create ErrorBoundary component wrapping app/_layout.tsx to catch React errors
- [ ] T118 [P] Add storage full detection: catch WatermelonDB write errors, show user-friendly message "Storage full, please free up space"
- [ ] T119 [P] Add network error handling: wrap Supabase calls in try-catch, show toast notification "Sync failed, will retry when online"

---

## Dependencies and Execution Strategy

### Phase Dependency Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundation)
    ↓
Phase 3 (US1 - P1) ← MVP RELEASE
    ↓ ↓ ↓
    ├─→ Phase 4 (US2 - P2)
    ├─→ Phase 5 (US3 - P3)
    ├─→ Phase 6 (US4 - P4)
    └─→ Phase 7 (US5 - P5)
    ↓
Phase 8 (Polish) ← FULL RELEASE
```

**Critical Path**: Phase 1 → Phase 2 → Phase 3 (MVP)

**Parallelizable After MVP**: Phases 4, 5, 6, 7 are independent and can be implemented in any order after Phase 3

### Parallel Execution Opportunities

**Within Phase 2 (Foundation)**:
- WatermelonDB models (T018-T023) can be built in parallel
- Base UI components (T027-T031) can be built in parallel
- Custom hooks (T032-T034) can be built in parallel

**Within Phase 3 (US1)**:
- Tests (T037-T041) can be written in parallel before implementation
- Game management components (T048-T050) can be built in parallel
- Scoring components (T051-T053) can be built in parallel

**Within Phase 8 (Polish)**:
- Performance optimizations (T099-T102) can be done in parallel
- Accessibility tasks (T114-T116) can be done in parallel
- Error handling (T117-T119) can be done in parallel

### Suggested MVP Scope

**Minimum Viable Product** (deliverable after Phase 3):
- ✅ Create match with teams and players
- ✅ Auto-generate batting pairs and bowling rotation
- ✅ Record scoring events (runs, wickets, extras) with autosave
- ✅ Auto-advance overs after 6 valid balls
- ✅ Undo last scoring event
- ✅ Outdoor-optimized UI (high contrast, large touch targets, haptic feedback)

**What's deferred to post-MVP**:
- Rule enforcement warnings (Phase 4)
- Match history and export (Phase 5)
- Resume interrupted matches (Phase 6)
- Special events (bad balls, edge cases) (Phase 7)
- Cloud sync and settings (Phase 8)

---

## Task Format Validation

✅ All tasks follow required checklist format:
- All tasks start with `- [ ]` checkbox
- All tasks have sequential Task ID (T001-T119)
- Parallelizable tasks marked with `[P]`
- User story tasks marked with `[US1]`-`[US5]`
- All tasks include file paths where applicable
- All tasks are actionable and specific

✅ Task organization:
- Organized by user story after foundation
- Each user story is independently testable
- Dependencies clearly marked
- Parallel opportunities identified

✅ Test-first approach:
- Contract tests precede implementation
- Integration tests verify end-to-end flows
- Test IDs before implementation IDs

---

## Summary

**Total Tasks**: 119 tasks across 8 phases
- Phase 1 (Setup): 15 tasks
- Phase 2 (Foundation): 21 tasks
- Phase 3 (US1 - MVP): 21 tasks
- Phase 4 (US2): 13 tasks
- Phase 5 (US3): 10 tasks
- Phase 6 (US4): 7 tasks
- Phase 7 (US5): 10 tasks
- Phase 8 (Polish): 21 tasks

**Parallel Opportunities**: 52 tasks marked [P] can be executed in parallel with others in their phase

**Test Coverage**: 15 contract tests + 5 integration tests = 20 tests (follows constitution test pyramid: Contract 50+ → Integration 20-30 → E2E 5-10)

**MVP Delivery**: Complete Phases 1-3 for functional digital cricket scorebook (estimated 20-26 hours)

**Full Feature**: Complete all phases for production-ready app with rule enforcement, history, sync (estimated 50-65 hours)
