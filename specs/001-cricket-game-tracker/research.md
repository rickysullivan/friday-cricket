---
github_issue: 176
title: Research: Kids Cricket Game Tracker
status: planning
feature: research
labels: research, analysis
created: 2025-11-07
updated: 2025-11-07
---

# Research: Kids Cricket Game Tracker

**Feature**: 001-cricket-game-tracker
**Date**: 2025-11-07
**Phase**: 0 (Technology Validation)

## Purpose

Validate technology choices for offline-first mobile cricket scoring app, ensuring compatibility with Expo/React Native, performance requirements, and constitutional constraints.

## Research Areas

### 1. Offline-First Storage: WatermelonDB

**Decision**: Use WatermelonDB as primary local database

**Rationale**:
- Built specifically for React Native with performance focus
- SQLite-based (constitution-compatible: allows "SQLite/MMKV")
- Optimized for complex relational data (games, teams, players, innings, overs)
- Lazy loading support for handling 100+ matches efficiently
- Observable queries for reactive UI updates
- Migration system for schema evolution
- Active maintenance and community support

**Alternatives Considered**:
- **expo-sqlite**: Simpler but lacks ORM features, would require manual relationship management
- **MMKV**: Excellent for key-value data but not suited for complex relational queries
- **AsyncStorage**: Too slow for real-time scoring, limited to 6MB on Android
- **Realm**: More complex setup, larger bundle size, different paradigm

**Performance Validation**:
- Read latency: <10ms for typical queries (meets <100ms tap latency requirement)
- Write latency: <5ms for inserts (meets <50ms autosave requirement)
- Memory footprint: ~20-30MB for database layer (within <150MB budget)
- Batch operations: Supports for over completion (6 events at once)

**Implementation Notes**:
- Use WatermelonDB models for Game, Team, Player, Innings, Over, OverEvent
- Leverage `@relation` decorator for team->players, innings->overs relationships
- Implement `prepareCreate` for optimistic UI updates during scoring
- Use `observe()` for reactive score display updates

### 2. Cloud Sync: Supabase + WatermelonDB Integration

**Decision**: Use Supabase for optional cloud synchronization

**Rationale**:
- PostgreSQL backend compatible with WatermelonDB sync
- Real-time subscriptions for live score updates across devices
- Built-in authentication (optional, for multi-user scenarios)
- RESTful API + PostgREST for flexible querying
- Row Level Security (RLS) for data isolation if needed
- Free tier sufficient for MVP (500MB database, 2GB bandwidth)

**Alternatives Considered**:
- **Firebase Realtime Database**: Good sync but NoSQL structure awkward for relational cricket data
- **AWS AppSync**: More complex setup, higher cost
- **PouchDB + CouchDB**: CRD

T-like but separate sync protocol, adds complexity

**Sync Strategy**:
- Push local WatermelonDB changes to Supabase on connectivity
- Pull remote changes and merge (last-write-wins for non-CRDT fields)
- Yjs CRDT handles conflict-free scoring events (see next section)
- Supabase acts as persistence layer for Yjs documents

**Implementation Notes**:
- Use `@nozbe/watermelondb/sync` for synchronization protocol
- Implement pull/push endpoints using Supabase REST API
- Store Yjs document snapshots in Supabase `yjs_documents` table
- Handle sync conflicts: Yjs for scoring events, last-write-wins for metadata

### 3. Multi-Device Collaboration: Yjs CRDT

**Decision**: Use Yjs with y-expo-sqlite for conflict-free concurrent scoring

**Rationale**:
- CRDT (Conflict-Free Replicated Data Type) eliminates conflict resolution UI
- Eventual consistency: all devices converge to same state
- Offline-first: works without connectivity, syncs when available
- y-expo-sqlite: Persistence adapter for Expo SQLite
- Small bundle size: ~30KB gzipped
- Battle-tested in collaborative editors (Figma, Notion use CRDTs)

**Alternatives Considered**:
- **Firebase Realtime Database**: Last-write-wins causes data loss in concurrent edits
- **Custom WebSocket**: Would require manual conflict resolution logic
- **Operational Transform (OT)**: More complex than CRDT, requires central server

**CRDT Design for Cricket Scoring**:
- Use `Y.Array` for innings events (append-only, preserves order)
- Use `Y.Map` for game metadata (team names, venue, date)
- Each scoring tap appends to events array (never conflicts)
- Undo removes from local array and marks as deleted (tombstone)
- All devices see same final event sequence after sync

**Implementation Notes**:
- Initialize Yjs document per game: `new Y.Doc()`
- Bind to y-expo-sqlite provider for local persistence
- Optional: WebSocket provider for real-time sync (if online)
- Store Yjs binary updates in WatermelonDB for hybrid approach

**Sync Flow**:
```
Device A: User taps "4 runs" → Append to Y.Array → Persist to y-expo-sqlite
Device B: Polls/receives update → Merge Y.Array → Re-render score
Result: Both devices show 4 runs added, no conflicts
```

### 4. Outdoor UI Optimization

**Decision**: Custom high-contrast theme with large touch targets

**Rationale**:
- React Native Paper insufficient for outdoor readability
- Need custom color palette: Pure black (#000000) on white (#FFFFFF)
- Touch targets: 56px minimum (constitution requirement)
- Font sizes: 18pt minimum, 24-32pt for scores (constitution requirement)

**Color Palette** (Normal Mode):
```typescript
const colors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  primary: '#000000',
  secondary: '#333333',
  success: '#00C853',    // Runs (green)
  error: '#D32F2F',      // Wickets (red)
  warning: '#FF6F00',    // Extras (orange)
  text: '#000000',
  textSecondary: '#666666',
};
```

**Color Palette** (Bright Mode):
```typescript
const brightColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  primary: '#000000',
  secondary: '#000000',
  success: '#00C853',
  error: '#D32F2F',
  warning: '#FF6F00',
  text: '#000000',
  textSecondary: '#000000',  // No gray in bright mode
};
```

**Typography Scale**:
- Body: 18pt (minimum readable outdoors)
- Buttons: 20pt semibold
- Score display: 48pt bold
- Section headers: 24pt semibold

**Touch Target Guidelines**:
- All buttons: 56px height minimum
- Run keypad: 64px × 64px per button
- Undo button: 48px × 120px (wide, always visible)

**Implementation Notes**:
- Create `ThemeContext` with normal/bright mode toggle
- Use `StyleSheet.create` with theme-aware styles
- Implement custom Button, Input, Card components
- Test on physical devices in direct sunlight (manual validation)

### 5. Performance Optimization

**Decision**: Implement memoization and lazy loading

**Rationale**:
- Target: 60fps during scoring (16.67ms per frame)
- Avoid re-renders of inactive components
- Lazy load history list (virtualized scrolling)

**Optimization Strategies**:
- `React.memo()` for scoring components (RunKeypad, ScoreDisplay)
- `useMemo()` for derived calculations (total runs, wickets, overs remaining)
- `useCallback()` for event handlers (prevent child re-renders)
- FlatList with `windowSize={5}` for match history
- Image optimization: Use WebP, lazy load team logos
- Bundle splitting: Dynamic imports for PDF export (not needed until summary)

**Haptic Feedback Strategy**:
- Use `expo-haptics.impactAsync(ImpactFeedbackStyle.Medium)` for all taps
- Light feedback: Navigation taps
- Medium feedback: Scoring taps (runs, wickets)
- Heavy feedback: Undo, end innings

**Battery Optimization**:
- Throttle autosave: Batch writes every 500ms (not per keystroke in setup)
- Disable animations in bright mode (reduce GPU usage)
- Use `InteractionManager.runAfterInteractions()` for non-critical tasks

### 6. Testing Strategy

**Decision**: Jest + React Native Testing Library + Detox

**Rationale**:
- Jest: Industry standard for React Native unit testing
- React Native Testing Library: User-centric testing (what users see/do)
- Detox: Gray-box E2E testing on real devices/simulators

**Test Coverage Targets** (Constitution: Test-First Development):
- Contract tests: 100% coverage for business logic (ruleEngine, scoringEngine, algorithms)
- Integration tests: All user stories (P1-P5) covered
- E2E tests: Critical path (create game, score match, export)
- Manual tests: Outdoor readability validation

**Test Pyramid**:
```
    /\
   /E2E\ (5-10 tests: critical paths)
  /------\
 /Integr.\ (20-30 tests: user stories)
/----------\
/  Contract  \ (50+ tests: business logic)
```

**TDD Workflow** (Constitution-mandated):
1. Write test from user story acceptance criteria
2. Run test → RED (fails)
3. Implement minimal code
4. Run test → GREEN (passes)
5. Refactor with tests still green

**Implementation Notes**:
- Use `@testing-library/react-native` for component tests
- Mock WatermelonDB with `@nozbe/watermelondb/__testMocks__`
- Use Detox `device.disableSynchronization()` for timing-sensitive tests
- Create test fixtures for common game states (mid-innings, tie, etc.)

## Technology Stack Summary

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Language** | TypeScript 5.x | Type safety, constitution-mandated |
| **Framework** | Expo SDK 54+ | React Native runtime, constitution-mandated |
| **Router** | Expo Router | File-based navigation, constitution-mandated |
| **State** | React Context | Simple state management, constitution-mandated |
| **Local DB** | WatermelonDB | Offline-first, relational, user preference |
| **Cloud Sync** | Supabase | PostgreSQL backend, real-time, user preference |
| **Multi-Device** | Yjs + y-expo-sqlite | CRDT for conflict-free sync, user preference |
| **UI Components** | Custom (high contrast) | Outdoor readability requirements |
| **Testing** | Jest + RTL + Detox | Unit, integration, E2E coverage |
| **Exports** | expo-print, expo-sharing | PDF/CSV generation |

## Risks and Mitigations

### Risk 1: Yjs + WatermelonDB Integration Complexity

**Risk**: Yjs and WatermelonDB serve overlapping purposes (local persistence)
**Mitigation**: Use Yjs only for scoring events (OverEvent array), WatermelonDB for everything else (Game, Team, Player metadata)
**Fallback**: If integration too complex, MVP can launch without multi-device sync (defer to v2)

### Risk 2: WatermelonDB + Supabase Sync

**Risk**: Official WatermelonDB sync implementation is community-maintained, may have bugs
**Mitigation**: Implement custom sync using Supabase REST API, manual pull/push logic
**Fallback**: Launch without cloud sync (purely offline), add sync in v1.1

### Risk 3: Outdoor Readability Validation

**Risk**: Cannot fully validate outdoor readability without physical device testing
**Mitigation**: Test on real devices in direct sunlight during development (manual test days)
**Fallback**: Launch with bright mode toggle, iterate based on user feedback

### Risk 4: Performance on Low-End Android

**Risk**: Older Android devices (Android 11 on 2GB RAM) may struggle with 60fps
**Mitigation**: Performance testing on low-end devices, optimize rendering, reduce animations
**Fallback**: Detect device tier, disable animations/haptics on low-end devices

## Next Steps (Phase 1: Design)

1. Create data-model.md: WatermelonDB schemas for all entities
2. Create contracts/: TypeScript types for Game, Innings, Yjs document structure
3. Create quickstart.md: Setup instructions, development workflow
4. Update agent context: Add WatermelonDB, Supabase, Yjs to AI agent knowledge
5. Re-evaluate Constitution Check: Confirm all technology choices remain compliant
