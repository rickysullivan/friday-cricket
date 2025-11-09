---
github_issue: 177
title: Data Model: Kids Cricket Game Tracker
status: planning
feature: data-model
labels: data-model, architecture
created: 2025-11-07
updated: 2025-11-07
---

# Data Model: Kids Cricket Game Tracker

**Feature**: 001-cricket-game-tracker
**Date**: 2025-11-07
**Phase**: 1 (Design & Contracts)

## Overview

WatermelonDB-based data model for offline-first cricket scoring. All entities use WatermelonDB models with SQLite persistence, observable queries for reactive UI, and optional Supabase cloud sync.

## Entity Relationship Diagram

```
Game (1) ───── (2) Team
  │                │
  │                └─── (8+) Player
  │
  └──── (1-2) Innings
          │
          └──── (16) Over
                  │
                  └──── (6+) OverEvent
```

## Entities

### 1. Game

Represents a complete cricket match with two teams and up to two innings.

**Fields**:
- `id`: string (UUID, primary key)
- `dateISO`: string (ISO 8601 datetime of match)
- `venue`: string? (optional location)
- `team_a_id`: string (foreign key -> Team)
- `team_b_id`: string (foreign key -> Team)
- `settings_scoring_enabled`: boolean (default: true)
- `status`: enum ('setup', 'in_progress', 'completed')
- `created_at`: number (timestamp)
- `updated_at`: number (timestamp)

**Relationships**:
- Has-many: `innings` (1-2 Innings records)
- Belongs-to: `teamA` (Team), `teamB` (Team)

**Validation Rules**:
- `team_a_id` and `team_b_id` must reference existing teams
- `team_a_id` !== `team_b_id` (teams must be different)
- `dateISO` must be valid ISO 8601 format
- `status` transitions: setup → in_progress → completed (one-way)

**Indexes**:
- `dateISO` (for history list sorting)
- `status` (for filtering in-progress games)

**State Transitions**:
```
setup (wizard) → in_progress (first ball bowled) → completed (16 overs or manual end)
```

### 2. Team

Represents a cricket team with a name and roster of players.

**Fields**:
- `id`: string (UUID, primary key)
- `name`: string (team name, 1-50 chars)
- `game_id`: string (foreign key -> Game)
- `created_at`: number (timestamp)
- `updated_at`: number (timestamp)

**Relationships**:
- Belongs-to: `game` (Game)
- Has-many: `players` (8+ Player records)

**Validation Rules**:
- `name` must be non-empty, max 50 characters
- `game_id` must reference existing game
- Must have at least 8 players before game can start

**Indexes**:
- `game_id` (for loading teams by game)

### 3. Player

Represents an individual player on a team.

**Fields**:
- `id`: string (UUID, primary key)
- `name`: string (player name, 1-30 chars)
- `team_id`: string (foreign key -> Team)
- `position`: number (batting order, 0-indexed)
- `created_at`: number (timestamp)
- `updated_at`: number (timestamp)

**Relationships**:
- Belongs-to: `team` (Team)

**Validation Rules**:
- `name` must be non-empty, max 30 characters
- `name` must be unique within `team_id` (enforced at application layer)
- `team_id` must reference existing team
- `position` must be 0 ≤ position < team.players.count

**Indexes**:
- `team_id, name` (unique constraint via application logic)
- `team_id, position` (for batting/bowling order)

### 4. Innings

Represents one team's batting period (16 overs max).

**Fields**:
- `id`: string (UUID, primary key)
- `game_id`: string (foreign key -> Game)
- `batting_team_id`: string (foreign key -> Team)
- `bowling_team_id`: string (foreign key -> Team)
- `innings_number`: number (1 or 2)
- `overs_planned`: number (default: 16)
- `overs_completed`: number (default: 0, computed from overs)
- `total_runs`: number (default: 0, computed from events)
- `total_wickets`: number (default: 0, computed from events)
- `status`: enum ('pending', 'in_progress', 'completed')
- `created_at`: number (timestamp)
- `updated_at`: number (timestamp)

**Relationships**:
- Belongs-to: `game` (Game)
- Belongs-to: `battingTeam` (Team), `bowlingTeam` (Team)
- Has-many: `overs` (0-16 Over records)
- Has-many: `battingPairs` (stored as JSON array, not separate model)

**Validation Rules**:
- `innings_number` must be 1 or 2
- `batting_team_id` !== `bowling_team_id`
- `overs_planned` must be 1-20 (16 default, editable)
- `overs_completed` ≤ `overs_planned`
- `total_wickets` ≤ 10 (max wickets)

**Computed Fields** (calculated, not stored):
- `balls_bowled`: sum of valid balls across all overs
- `extras`: sum of wides and no-balls
- `run_rate`: total_runs / (overs_completed + balls_in_current_over / 6)

**battingPairs JSON Structure**:
```typescript
[
  {
    id: string,
    player1_id: string,
    player2_id: string,
    overs_planned: 4,
    overs_faced: 0  // computed from overs
  },
  ...
]
```

**State Transitions**:
```
pending (created) → in_progress (first ball) → completed (16 overs or manual end)
```

### 5. Over

Represents a set of 6 deliveries by one bowler.

**Fields**:
- `id`: string (UUID, primary key)
- `innings_id`: string (foreign key -> Innings)
- `over_number`: number (1-16, 1-indexed for display)
- `bowler_id`: string (foreign key -> Player)
- `balls_bowled`: number (0-6+, includes extras)
- `valid_balls`: number (0-6, excludes wides/no-balls)
- `runs_scored`: number (computed from events)
- `wickets_taken`: number (computed from events)
- `created_at`: number (timestamp)
- `updated_at`: number (timestamp)

**Relationships**:
- Belongs-to: `innings` (Innings)
- Belongs-to: `bowler` (Player)
- Has-many: `events` (6+ OverEvent records)

**Validation Rules**:
- `over_number` must be 1 ≤ over_number ≤ innings.overs_planned
- `bowler_id` must reference player on bowling team
- `bowler_id` cannot repeat from previous over (consecutive bowler check)
- `valid_balls` ≤ 6 (over complete when valid_balls === 6)

**Computed Fields**:
- `is_complete`: valid_balls === 6
- `economy_rate`: (runs_scored / valid_balls) × 6

**Indexes**:
- `innings_id, over_number` (unique, for ordered loading)

**State Transitions**:
```
in_progress (0-5 valid balls) → complete (6 valid balls or manual advance)
```

### 6. OverEvent

Represents a single delivery or extra (runs, wicket, wide, no-ball, bad ball).

**Fields**:
- `id`: string (UUID, primary key)
- `over_id`: string (foreign key -> Over)
- `sequence`: number (0-indexed position in over)
- `event_type`: enum ('run', 'wicket', 'wide', 'noball', 'badball_freehit')
- `runs`: number (0-6 for run, 1 for wide/noball, 0+ for badball result)
- `is_valid_ball`: boolean (false for wide/noball, true otherwise)
- `created_at`: number (timestamp)

**Relationships**:
- Belongs-to: `over` (Over)

**Validation Rules**:
- `event_type` must be one of: 'run', 'wicket', 'wide', 'noball', 'badball_freehit'
- `runs` must be 0-6 for 'run', exactly 1 for 'wide'/'noball', 0+ for 'badball_freehit'
- `is_valid_ball` = false for 'wide'/'noball', true for others
- `sequence` must be unique within over (0-indexed)

**Event Type Details**:
- **run**: Normal delivery, runs = 0 (dot), 1, 2, 3, 4, 6 (no 5s in cricket)
- **wicket**: Dismissal, runs = 0, is_valid_ball = true
- **wide**: Extra delivery, runs = 1, is_valid_ball = false
- **noball**: Extra delivery, runs = 1, is_valid_ball = false
- **badball_freehit**: Bad ball leading to free hit, runs = result (0-6), is_valid_ball = true

**Indexes**:
- `over_id, sequence` (unique, for ordered loading)
- `created_at` (for undo - last event by time)

**Undo Behavior**:
- Deleting an event decrements over.balls_bowled
- Cannot delete events if subsequent events exist (immutable history beyond last event)
- Undo only affects most recent event (single-level undo per constitution)

## WatermelonDB Schema

**Migration Version**: 1

```typescript
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'games',
      columns: [
        { name: 'date_iso', type: 'string', isIndexed: true },
        { name: 'venue', type: 'string', isOptional: true },
        { name: 'team_a_id', type: 'string', isIndexed: true },
        { name: 'team_b_id', type: 'string', isIndexed: true },
        { name: 'settings_scoring_enabled', type: 'boolean' },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'teams',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'game_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'players',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'team_id', type: 'string', isIndexed: true },
        { name: 'position', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'innings',
      columns: [
        { name: 'game_id', type: 'string', isIndexed: true },
        { name: 'batting_team_id', type: 'string' },
        { name: 'bowling_team_id', type: 'string' },
        { name: 'innings_number', type: 'number' },
        { name: 'overs_planned', type: 'number' },
        { name: 'overs_completed', type: 'number' },
        { name: 'total_runs', type: 'number' },
        { name: 'total_wickets', type: 'number' },
        { name: 'batting_pairs', type: 'string' }, // JSON
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'overs',
      columns: [
        { name: 'innings_id', type: 'string', isIndexed: true },
        { name: 'over_number', type: 'number', isIndexed: true },
        { name: 'bowler_id', type: 'string' },
        { name: 'balls_bowled', type: 'number' },
        { name: 'valid_balls', type: 'number' },
        { name: 'runs_scored', type: 'number' },
        { name: 'wickets_taken', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'over_events',
      columns: [
        { name: 'over_id', type: 'string', isIndexed: true },
        { name: 'sequence', type: 'number' },
        { name: 'event_type', type: 'string' },
        { name: 'runs', type: 'number' },
        { name: 'is_valid_ball', type: 'boolean' },
        { name: 'created_at', type: 'number', isIndexed: true },
      ],
    }),
  ],
})
```

## Data Flow Examples

### Example 1: Creating a New Game

```typescript
// Step 1: User enters teams and players in wizard
await database.write(async () => {
  const game = await database.get('games').create((g) => {
    g.dateISO = new Date().toISOString()
    g.venue = 'Smith Park'
    g.status = 'setup'
    g.settingsScoringEnabled = true
  })

  const teamA = await database.get('teams').create((t) => {
    t.name = 'Eagles'
    t.game.set(game)
  })

  const teamB = await database.get('teams').create((t) => {
    t.name = 'Tigers'
    t.game.set(game)
  })

  // Add 8 players to each team
  for (let i = 0; i < 8; i++) {
    await database.get('players').create((p) => {
      p.name = `Player ${i + 1}`
      p.team.set(teamA)
      p.position = i
    })
  }
  // (repeat for teamB)

  // Update game with team references
  await game.update((g) => {
    g.teamAId = teamA.id
    g.teamBId = teamB.id
  })
})

// Step 2: System auto-generates batting pairs and bowling rotation
const battingPairs = generateBattingPairs(teamA.players) // Algorithm
const bowlingRotation = generateBowlingRotation(teamB.players) // Algorithm

// Step 3: Create first innings
await database.write(async () => {
  const innings = await database.get('innings').create((i) => {
    i.game.set(game)
    i.battingTeamId = teamA.id
    i.bowlingTeamId = teamB.id
    i.inningsNumber = 1
    i.oversPlanned = 16
    i.battingPairs = JSON.stringify(battingPairs)
    i.status = 'pending'
  })

  await game.update((g) => { g.status = 'in_progress' })
})
```

### Example 2: Recording a Scoring Event

```typescript
// User taps "4 runs" button
await database.write(async () => {
  const currentOver = await innings.overs
    .extend(Q.where('over_number', innings.oversCompleted + 1))
    .fetch()[0]

  // Create OverEvent
  const event = await database.get('over_events').create((e) => {
    e.over.set(currentOver)
    e.sequence = currentOver.ballsBowled
    e.eventType = 'run'
    e.runs = 4
    e.isValidBall = true
  })

  // Update Over (computed fields)
  await currentOver.update((o) => {
    o.ballsBowled += 1
    o.validBalls += 1
    o.runsScored += 4
  })

  // Update Innings (computed totals)
  await innings.update((i) => {
    i.totalRuns += 4
    if (currentOver.validBalls === 6) {
      i.oversCompleted += 1
    }
  })

  // Trigger haptic feedback
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

  // Show "Saved" toast
  showToast('Saved')
})

// UI updates reactively via WatermelonDB observables
```

### Example 3: Undo Last Event

```typescript
// User taps "Undo" button
await database.write(async () => {
  // Find most recent event
  const lastEvent = await database.get('over_events')
    .query(Q.sortBy('created_at', Q.desc))
    .fetch()[0]

  if (!lastEvent) return // No events to undo

  const over = await lastEvent.over.fetch()
  const innings = await over.innings.fetch()

  // Delete event
  await lastEvent.markAsDeleted() // Soft delete in WatermelonDB

  // Revert Over (recompute from remaining events)
  const remainingEvents = await over.events.fetch()
  const newRuns = remainingEvents.reduce((sum, e) => sum + e.runs, 0)
  const newWickets = remainingEvents.filter(e => e.eventType === 'wicket').length
  const newValidBalls = remainingEvents.filter(e => e.isValidBall).length

  await over.update((o) => {
    o.ballsBowled = remainingEvents.length
    o.validBalls = newValidBalls
    o.runsScored = newRuns
    o.wicketsTaken = newWickets
  })

  // Revert Innings (recompute totals from all overs)
  const allOvers = await innings.overs.fetch()
  const totalRuns = allOvers.reduce((sum, o) => sum + o.runsScored, 0)
  const totalWickets = allOvers.reduce((sum, o) => sum + o.wicketsTaken, 0)

  await innings.update((i) => {
    i.totalRuns = totalRuns
    i.totalWickets = totalWickets
  })
})
```

## Performance Considerations

- **Query Optimization**: Use `Q.where()` with indexed columns (`dateISO`, `status`, `team_id`, etc.)
- **Lazy Loading**: WatermelonDB loads relationships lazily (call `.fetch()` only when needed)
- **Batch Writes**: Use single `database.write()` block for multiple operations
- **Observable Queries**: UI subscribes to `.observe()` for reactive updates (no manual refresh)
- **JSON Fields**: `battingPairs` stored as JSON to avoid 8 separate BattingPair models (simpler, fewer joins)

## Sync Considerations (Supabase)

- **Push**: Send local changes to Supabase after each `database.write()`
- **Pull**: Poll Supabase every 5 seconds when online, merge remote changes
- **Conflict Resolution**: Last-write-wins for metadata (game, team, player), Yjs CRDT for scoring events
- **Yjs Integration**: Store Yjs document binary in separate `yjs_documents` table (not shown here, see contracts/)
