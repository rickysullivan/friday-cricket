---
github_issue: 110
title: Quickstart Guide: Kids Cricket Game Tracker
status: planning
feature: quickstart
labels: documentation
created: 2025-11-08
updated: 2025-11-08
---

# Quickstart Guide: Kids Cricket Game Tracker

**Feature**: 001-cricket-game-tracker
**Date**: 2025-11-07
**Purpose**: Setup instructions and development workflow for implementing the cricket scoring app

## Prerequisites

### Required Tools

- **Node.js**: v20.x or later (LTS recommended)
- **npm**: v10.x or later (comes with Node.js)
- **Expo CLI**: Latest (install via `npx expo`)
- **Git**: For version control
- **iOS**: Xcode 15+ and iOS Simulator (macOS only)
- **Android**: Android Studio with Android SDK 34+ and emulator

### Recommended Tools

- **VS Code**: With React Native, TypeScript, and Expo extensions
- **React Native Debugger**: For debugging React Native apps
- **Flipper**: For debugging WatermelonDB queries
- **Physical Devices**: iOS 15+ or Android 11+ for outdoor testing

### Account Setup

- **Supabase Account**: Sign up at https://supabase.com (free tier sufficient for MVP)
- **Expo Account**: Sign up at https://expo.dev for cloud builds (optional)

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd friday-cricket
git checkout 001-cricket-game-tracker
```

### 2. Install Dependencies

```bash
npm install
```

**Core Dependencies** (will be installed automatically):

```json
{
  "expo": "~54.0.0",
  "react-native": "0.76.x",
  "typescript": "^5.7.0",
  "@nozbe/watermelondb": "^0.27.0",
  "@supabase/supabase-js": "^2.46.0",
  "yjs": "^13.6.0",
  "y-expo-sqlite": "^1.0.0",
  "expo-router": "~4.0.0",
  "expo-haptics": "~14.0.0",
  "expo-print": "~14.0.0",
  "expo-sharing": "~13.0.0"
}
```

### 3. Configure WatermelonDB

WatermelonDB requires native setup for iOS and Android:

```bash
# iOS (macOS only)
cd ios
pod install
cd ..

# Android - no additional setup required (auto-links)
```

### 4. Configure Supabase

Create a `.env` file in the project root:

```bash
# Copy template
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Supabase Setup Steps**:

1. Create a new Supabase project at https://supabase.com/dashboard
2. Navigate to Settings → API to get URL and anon key
3. Run database migrations (see Database Schema section below)

### 5. Database Schema (Supabase)

Create tables in Supabase SQL Editor:

```sql
-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_iso TEXT NOT NULL,
  venue TEXT,
  team_a_id UUID,
  team_b_id UUID,
  settings_scoring_enabled BOOLEAN DEFAULT TRUE,
  status TEXT NOT NULL CHECK (status IN ('setup', 'in_progress', 'completed')),
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (LENGTH(name) BETWEEN 1 AND 50),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (LENGTH(name) BETWEEN 1 AND 30),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  UNIQUE (team_id, name) -- Names must be unique within team
);

-- Innings table
CREATE TABLE innings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  batting_team_id UUID NOT NULL REFERENCES teams(id),
  bowling_team_id UUID NOT NULL REFERENCES teams(id),
  innings_number SMALLINT NOT NULL CHECK (innings_number IN (1, 2)),
  overs_planned INTEGER NOT NULL DEFAULT 16,
  overs_completed INTEGER NOT NULL DEFAULT 0,
  total_runs INTEGER NOT NULL DEFAULT 0,
  total_wickets INTEGER NOT NULL DEFAULT 0,
  batting_pairs TEXT NOT NULL, -- JSON array
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Overs table
CREATE TABLE overs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  innings_id UUID NOT NULL REFERENCES innings(id) ON DELETE CASCADE,
  over_number INTEGER NOT NULL,
  bowler_id UUID NOT NULL REFERENCES players(id),
  balls_bowled INTEGER NOT NULL DEFAULT 0,
  valid_balls INTEGER NOT NULL DEFAULT 0,
  runs_scored INTEGER NOT NULL DEFAULT 0,
  wickets_taken INTEGER NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Over events table
CREATE TABLE over_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  over_id UUID NOT NULL REFERENCES overs(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('run', 'wicket', 'wide', 'noball', 'badball_freehit')),
  runs INTEGER NOT NULL CHECK (runs BETWEEN 0 AND 6),
  is_valid_ball BOOLEAN NOT NULL,
  created_at BIGINT NOT NULL
);

-- Yjs snapshots table (for Yjs CRDT persistence)
CREATE TABLE yjs_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  snapshot_data BYTEA NOT NULL, -- Binary Yjs state vector
  created_at BIGINT NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_date ON games(date_iso);
CREATE INDEX idx_teams_game ON teams(game_id);
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_innings_game ON innings(game_id);
CREATE INDEX idx_overs_innings ON overs(innings_id);
CREATE INDEX idx_over_events_over ON over_events(over_id);
CREATE INDEX idx_yjs_documents_game ON yjs_documents(game_id);
```

---

## Development Workflow

### Start Development Server

```bash
npx expo start
```

This opens the Expo Dev Tools in your browser. From here you can:

- Press `i` to open iOS Simulator (macOS only)
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app on physical device

### Run on Physical Device (Recommended for Outdoor Testing)

1. Install Expo Go app on your device:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Ensure device and computer are on same Wi-Fi network

3. Scan QR code from Expo Dev Tools

### Hot Reload

Expo supports Fast Refresh (hot reload):

- Changes to TypeScript/JSX files reload automatically
- Changes to native modules (WatermelonDB schema) require full restart

---

## Test-First Development (TDD Workflow)

The constitution mandates **Test-First Development**. Follow this workflow for all features:

### 1. Write Test (RED Phase)

```bash
# Create test file in tests/contract/ or tests/integration/
touch tests/contract/ruleEngine.test.ts
```

Write test from user story acceptance criteria:

```typescript
// tests/contract/ruleEngine.test.ts
import { validateBowlingRotation } from '@/services/ruleEngine';

describe('FR-015: Consecutive Bowler Prevention', () => {
  it('should return error when same bowler selected for consecutive overs', () => {
    const result = validateBowlingRotation({
      currentOverNumber: 5,
      proposedBowlerId: 'player-123',
      previousBowlerId: 'player-123',
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('consecutive');
  });
});
```

Run test (should fail):

```bash
npm test -- ruleEngine.test.ts
```

### 2. Implement Minimal Code (GREEN Phase)

```typescript
// src/services/ruleEngine.ts
export function validateBowlingRotation(params) {
  if (params.proposedBowlerId === params.previousBowlerId) {
    return {
      isValid: false,
      errorMessage: 'Same bowler cannot bowl consecutive overs',
    };
  }
  return { isValid: true };
}
```

Run test (should pass):

```bash
npm test -- ruleEngine.test.ts
```

### 3. Refactor (Tests Still GREEN)

Improve code quality without changing behavior:

```typescript
export interface BowlingRotationValidation {
  currentOverNumber: number;
  proposedBowlerId: string;
  previousBowlerId: string;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function validateBowlingRotation(
  params: BowlingRotationValidation
): ValidationResult {
  const { proposedBowlerId, previousBowlerId } = params;

  if (proposedBowlerId === previousBowlerId) {
    return {
      isValid: false,
      errorMessage: 'Same bowler cannot bowl consecutive overs (Friday Cricket rule)',
    };
  }

  return { isValid: true };
}
```

Run test again (should still pass):

```bash
npm test
```

---

## Running Tests

### Unit/Contract Tests (Jest)

```bash
# Run all tests
npm test

# Run specific test file
npm test -- ruleEngine.test.ts

# Run tests in watch mode (re-runs on file changes)
npm test -- --watch

# Run with coverage report
npm test -- --coverage
```

**Coverage Targets** (Constitution):
- Contract tests: 100% coverage for business logic (ruleEngine, scoringEngine, algorithms)

### Integration Tests (React Native Testing Library)

```bash
# Run integration tests
npm test -- tests/integration

# Run specific integration test
npm test -- createGame.test.ts
```

### E2E Tests (Detox)

```bash
# Build app for testing (first time only)
npm run detox:build:ios
npm run detox:build:android

# Run E2E tests
npm run detox:test:ios
npm run detox:test:android
```

---

## Debugging

### React Native Debugger

1. Install React Native Debugger: https://github.com/jhen0409/react-native-debugger

2. Start Expo dev server:
   ```bash
   npx expo start
   ```

3. Enable Remote JS Debugging in app dev menu (shake device or Cmd+D on iOS, Cmd+M on Android)

4. React Native Debugger opens automatically

### WatermelonDB Debugging (Flipper)

1. Install Flipper: https://fbflipper.com

2. Enable Flipper plugin in app:
   ```typescript
   // src/models/database.ts
   import { setUpDebug } from '@nozbe/watermelondb/DatabaseProvider'

   if (__DEV__) {
     setUpDebug()
   }
   ```

3. Open Flipper → Databases → WatermelonDB

4. Inspect tables, queries, and performance

### Yjs CRDT Debugging

```typescript
// src/sync/yjs/gameDoc.ts
import * as Y from 'yjs';

const doc = new Y.Doc();

// Enable logging
doc.on('update', (update: Uint8Array, origin: any) => {
  console.log('Yjs update:', { update, origin });
});

doc.on('change', (changes: any) => {
  console.log('Yjs changes:', changes);
});
```

---

## Outdoor Testing (Manual Validation)

### Bright Sunlight Test

**Purpose**: Validate FR-033 (high contrast) and FR-034 (bright mode)

1. Build development app on physical device
2. Go outside on a sunny day (direct sunlight, 10am-3pm ideal)
3. Test readability:
   - Can you read score display without squinting? ✅/❌
   - Can you read run buttons (0, 1-6) clearly? ✅/❌
   - Toggle bright mode → Does it improve readability? ✅/❌

### Large Touch Target Test

**Purpose**: Validate FR-035 (56px minimum touch targets)

1. Put on gardening gloves (simulate gloved fingers)
2. Attempt to tap all buttons with gloves on
3. Verify no accidental taps on adjacent buttons

### One-Handed Operation Test

**Purpose**: Validate FR-038 (one-handed operation)

1. Hold device in dominant hand only
2. Attempt to score a full over using only that hand
3. Verify all primary scoring buttons are reachable with thumb

### Haptic Feedback Test

**Purpose**: Validate FR-037 (strong haptic feedback)

1. Enable silent mode on device
2. Tap scoring buttons
3. Verify haptic feedback is strong enough to feel outdoors (wind, noise)

---

## Common Tasks

### Add New WatermelonDB Model

1. Define model schema in `src/models/schema.ts`:
   ```typescript
   tableSchema({
     name: 'my_table',
     columns: [
       { name: 'my_field', type: 'string' },
     ],
   })
   ```

2. Create model class in `src/models/MyModel.ts`:
   ```typescript
   import { Model } from '@nozbe/watermelondb';

   export default class MyModel extends Model {
     static table = 'my_table';
   }
   ```

3. Register model in database:
   ```typescript
   // src/models/database.ts
   import MyModel from './MyModel';

   export const database = new Database({
     adapter,
     modelClasses: [Game, Team, Player, MyModel],
   });
   ```

4. Run migration if schema changed

### Add New Screen (Expo Router)

1. Create file in `app/` directory:
   ```bash
   touch app/my-screen.tsx
   ```

2. Export default React component:
   ```typescript
   export default function MyScreen() {
     return <View><Text>My Screen</Text></View>;
   }
   ```

3. Navigate using `router.push()`:
   ```typescript
   import { router } from 'expo-router';

   router.push('/my-screen');
   ```

### Add Yjs CRDT Event Type

1. Update `sync-schema.ts`:
   ```typescript
   export type OverEventType = 'run' | 'wicket' | 'my_new_event';
   ```

2. Update Yjs document structure in `src/sync/yjs/gameDoc.ts`

3. Update sync logic in `src/sync/supabase/sync.ts`

---

## Troubleshooting

### iOS Build Fails

**Issue**: `pod install` fails with dependency errors

**Fix**:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

### Android Build Fails

**Issue**: Gradle build fails with "SDK not found"

**Fix**:
1. Open Android Studio
2. Tools → SDK Manager → Install Android SDK 31+
3. Set `ANDROID_HOME` environment variable:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   ```

### WatermelonDB Crashes on Launch

**Issue**: App crashes with "Database schema mismatch"

**Fix**: Delete app and reinstall (schema changed):
```bash
npx expo start --clear
```

### Supabase Sync Not Working

**Issue**: Changes not syncing to cloud

**Fix**:
1. Check `.env` file has correct credentials
2. Verify Supabase URL is reachable:
   ```bash
   curl https://your-project.supabase.co/rest/v1/
   ```
3. Check Supabase logs in dashboard for errors

### Yjs Updates Not Merging

**Issue**: Multiple devices show different scores

**Fix**:
1. Check all devices are using same `game_id`
2. Verify Yjs document is initialized before appending events
3. Check network connectivity (Yjs requires sync to merge)

---

## Next Steps

1. **Phase 2**: Run `/speckit.tasks` to generate `tasks.md` with implementation task breakdown
2. **Implementation**: Follow TDD workflow to implement P1 features (game setup + scoring)
3. **Outdoor Testing**: Validate readability and usability in real-world conditions
4. **Iterate**: Refine based on manual test feedback

---

## References

- **Expo Documentation**: https://docs.expo.dev
- **WatermelonDB Documentation**: https://watermelondb.dev/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Yjs Documentation**: https://docs.yjs.dev
- **React Native Testing Library**: https://callstack.github.io/react-native-testing-library/
- **Detox Documentation**: https://wix.github.io/Detox/

For questions or issues, refer to:
- **Specification**: `specs/001-cricket-game-tracker/spec.md`
- **Data Model**: `specs/001-cricket-game-tracker/data-model.md`
- **Plan**: `specs/001-cricket-game-tracker/plan.md`
- **Constitution**: `.specify/memory/constitution.md`
