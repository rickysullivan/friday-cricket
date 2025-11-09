# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Friday Cricket Game Tracker** - Mobile app for scoring kids' cricket matches. Built with Expo/React Native, designed for outdoor use in bright sunlight with offline-first architecture.

**Current Phase**: Pre-implementation (specs complete, 119 tasks defined, synced to GitHub)

**Tech Stack**:
- TypeScript 5.x + React Native via Expo SDK 54+
- WatermelonDB (offline-first SQLite)
- Supabase (optional cloud sync)
- Yjs CRDT (multi-device collaboration via y-expo-sqlite)
- Expo Router (file-based navigation)

## Development Commands

This project is in the specification phase - no build commands yet. Once implementation begins:

Expected commands (to be confirmed):
```bash
npm install              # Install dependencies
npm start                # Start Expo dev server
npm test                 # Run Jest tests
npm run lint             # Run ESLint
npm run ios              # Open iOS simulator
npm run android          # Open Android emulator
```

## Spec Kit Workflow

This project uses **Spec Kit** for specification-driven development with automatic GitHub synchronization.

### Key Commands

```bash
# Sync specs to GitHub (creates/updates issues and project board)
./sync-to-github.sh

# Or use the main sync script directly
./scripts/sync-to-github.sh

# Watch mode (auto-sync on file changes)
./scripts/sync-to-github.sh watch

# Check sync status
./scripts/sync-to-github.sh status
```

### Slash Commands

When working in this repo, use these slash commands for spec management:
- `/speckit.implement` - Start implementing tasks from tasks.md
- `/speckit.analyze` - Check consistency across spec files
- `/speckit.tasks` - Regenerate tasks from plan
- `/speckit.plan` - Update implementation plan

## Architecture & Design Principles

### Constitution-Mandated Constraints

The project has a strict **constitution** (referenced in plan.md) that enforces:

1. **Outdoor-First UX**:
   - High contrast UI (no grays)
   - Large touch targets (≥56px)
   - Bold fonts (≥18pt)
   - Strong haptics for outdoor tactile feedback
   - One-handed operation priority

2. **Offline-First & Data Reliability**:
   - Local-first with WatermelonDB
   - Autosave after every scoring event (<50ms target)
   - Optional cloud sync (not required for core functionality)

3. **Rule Enforcement Over Flexibility**:
   - Automatically enforce Friday Cricket rules
   - Prevent violations (batting pair >4 overs, consecutive bowler, etc.)
   - Show warnings before constraint breaches

4. **Fast Interaction Over Feature Richness**:
   - Single-tap scoring (no confirmation dialogs)
   - Slide-in panels for secondary actions
   - Single-level undo only (immutable history)
   - <100ms tap-to-feedback latency

5. **Test-First Development**:
   - Contract tests for all business logic
   - Integration tests for critical user flows
   - Must be TDD - write tests before implementation

### Technology Mandates

- **Platform**: Expo + React Native + TypeScript (no native Swift/Kotlin)
- **Navigation**: Expo Router (file-based, no React Navigation)
- **State**: React Context only (no Redux, MobX, Zustand)
- **Styling**: Custom components (no component libraries like NativeBase)
- **Data**: WatermelonDB for local, Supabase for optional sync

## Project Structure

```
specs/001-cricket-game-tracker/    # All specification documents
  ├── spec.md                      # Main feature spec (user stories US1-US6)
  ├── plan.md                      # Implementation plan (architecture, data model)
  ├── tasks.md                     # 119 tasks (T001-T119) organized by phase
  ├── data-model.md                # Database schema and relationships
  ├── research.md                  # Technology decisions and rationale
  ├── tech-preferences.md          # User's preferred technologies
  └── requirements.md              # Quality checklist

scripts/                           # Sync and utility scripts
  ├── sync-to-github.sh           # Main GitHub sync (gh CLI or API)
  └── add-frontmatter.sh          # Add metadata to specs

.github/workflows/
  └── spec-sync.yml               # Auto-sync on push (if configured)

sync-to-github.sh                 # One-click setup wrapper
```

**Implementation structure** (to be created):
```
app/                              # Expo Router screens
src/
  ├── components/                 # React components
  ├── models/                     # WatermelonDB models
  ├── services/                   # Business logic
  ├── hooks/                      # Custom React hooks
  ├── context/                    # React Context providers
  ├── utils/                      # Utilities
  └── sync/                       # Yjs/Supabase sync
tests/
  ├── contract/                   # Business logic tests
  ├── integration/                # User flow tests
  └── e2e/                        # Detox tests
```

## GitHub Integration

**Current State**: 119 tasks synced to GitHub

- **Issues**: https://github.com/rickysullivan/friday-cricket/issues
- **Project Board**: https://github.com/users/rickysullivan/projects/2
- **Issue Format**: Each task (T001-T119) has a GitHub issue with:
  - Clean title (no task ID prefix)
  - Labels: task ID (T001), user story (us1-us6), tags ([P] → `p`)
  - All 119 issues added to project board

### Task Label System

Tasks in `tasks.md` use this format:
```markdown
- [ ] T001 Initialize Expo project
- [ ] T002 [P] Install core dependencies
- [ ] T015 [P] [US1] Create scoring screen
```

**Label extraction**:
- `T001` → Label: `T001` (task ID)
- `[P]` → Label: `p` (parallel/priority)
- `[US1]` → Label: `us1` (user story 1)

**Title cleaning**:
- `T002 [P] Install dependencies` → Issue title: `Install dependencies`

## Critical Gotchas (Read AGENTS.md for Full Details)

### macOS Compatibility

The sync scripts are macOS-compatible but have specific requirements:
- ✅ `sed -i ''` (macOS requires empty string for in-place edits)
- ✅ Use `< <(command)` not pipes for loops (avoid subshell scope issues)
- ✅ Echo to stderr (`>&2`) in functions returning values
- ✅ Array-based `gh` commands (never use `eval` with strings)

### GitHub CLI Limits

**CRITICAL**: GitHub CLI has default limits that will mislead you:
- `gh issue list` → defaults to 30 items
- `gh project item-list` → defaults to 30 items
- **ALWAYS use `--limit 200`** when checking totals

Example:
```bash
# WRONG - only shows 30 issues
gh issue list --repo rickysullivan/friday-cricket

# CORRECT - shows all issues
gh issue list --repo rickysullivan/friday-cricket --limit 200
```

### Sync Validation

Before declaring sync "successful", verify 1:1 mapping:
```bash
# Expected: 119 for all three
echo "Tasks: $(grep -c "^- \[ \] T[0-9]" specs/*/tasks.md)"
echo "Issues: $(gh issue list --repo rickysullivan/friday-cricket --limit 200 --json number | jq '. | length')"
echo "Project: $(gh project item-list 2 --owner rickysullivan --limit 200 --format json | jq '.items | length')"
```

### Debugging Strategy

See **AGENTS.md** for comprehensive debugging playbook including:
- Pre-sync validation checklist
- Finding duplicate issues
- Finding missing project items
- Cleaning up before re-sync
- macOS compatibility rules

**Golden Rule**: Test sync changes on a dummy repo first. Never debug on live data.

## Performance Targets

When implementing, these are the measurable goals:

- **Cold start**: <2s to home screen
- **Scoring latency**: <100ms tap-to-feedback
- **Autosave**: <50ms per event write to WatermelonDB
- **Frame rate**: 60fps minimum during active scoring
- **Memory**: <150MB peak
- **Battery**: <5% drain per hour of continuous scoring

## Testing Requirements

All implementation must follow TDD:

1. **Contract tests** - Test business logic in isolation
   - Rule engine (batting pair limits, bowling rotation)
   - Scoring calculations (runs, wickets, overs)
   - Pairing algorithms

2. **Integration tests** - Test component interactions
   - Game setup → scoring → summary flows
   - Autosave → resume after crash
   - Export to PDF/CSV

3. **E2E tests** - Test on real devices
   - Full game scoring scenario
   - Multi-device concurrent scoring
   - Outdoor sunlight readability (manual)

## Key Constraints

- **Single-level undo only** - No undo history, just reverse last event
- **Immutable history** - Past events cannot be edited (except via undo)
- **Unique player names** - Within each team
- **Wickets as count** - No dismissal type tracking
- **No network dependency** - All core features work offline

## File Conventions

**Spec files** use YAML frontmatter:
```yaml
---
title: Feature Name
status: planning|in-progress|completed
feature: feature-id
labels: label1, label2
github_issue: 123
---
```

**Task format** in tasks.md:
```markdown
### Phase 1: Setup

- [ ] T001 Task description
- [ ] T002 [P] Priority task
- [ ] T003 [P] [US1] Task for user story 1
```

## User Stories Reference

- **US1**: Create and Score a Match (P1) - Core scoring functionality
- **US2**: Rule Enforcement (P2) - Automated Friday Cricket rules
- **US3**: Match History & Export (P3) - View past games, export PDF/CSV
- **US4**: Resume Interrupted Matches (P4) - Crash recovery
- **US5**: Special Events & Edge Cases (P5) - Bad balls, odd player counts
- **US6**: Accessibility & Settings (P6) - VoiceOver, bright mode, haptics

---

*Last updated: 2025-11-09*
*Implementation has not started - specs are complete, tasks ready*
