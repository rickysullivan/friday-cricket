# Cricket Game Tracker - Spec Kit Project

This project uses Spec Kit for specification-driven development with automatic GitHub synchronization.

## Quick Start

1. **Initial Setup** (one time only):
```bash
./sync-to-github.sh
```

2. **Start Development**:
```bash
/speckit.implement specs/001-cricket-game-tracker/spec.md
```

3. **Keep Synced** (optional - run in separate terminal):
```bash
./scripts/sync-to-github.sh watch
```

## GitHub CLI Support

This project automatically detects and uses GitHub CLI (`gh`) if installed:
- ✅ **With `gh`**: No token needed, faster sync, project creation support
- ✅ **Without `gh`**: Falls back to API calls with personal access token

Install GitHub CLI for the best experience: https://cli.github.com

## Project Structure

```
.
├── specs/                      # Specification documents
│   └── 001-cricket-game-tracker/
│       ├── spec.md            # Main specification
│       ├── plan.md            # Implementation plan  
│       ├── tasks.md           # Task breakdown (T001-T119)
│       ├── data-model.md      # Data architecture
│       ├── research.md        # Technology decisions
│       └── requirements.md    # Requirements checklist
├── scripts/                   # Sync and utility scripts
│   ├── sync-to-github.sh     # Main GitHub sync (uses gh or API)
│   └── add-frontmatter.sh    # Add metadata to specs
├── .github/
│   └── workflows/
│       └── spec-sync.yml      # Auto-sync on push
└── sync-to-github.sh          # One-click setup script
```

## GitHub Integration

After running `./sync-to-github.sh`, you'll have:
- **125+ GitHub Issues** tracking all specs and tasks
- **GitHub Project Board** organizing work by phase
- **Task labels** (T001-T119) for cross-referencing
- **Phase labels** (phase-1 through phase-8) for workflow
- **Automatic sync** via GitHub Actions

## Development Workflow

1. Specs are in `specs/` directory
2. Each task has a GitHub issue with labels
3. Work through phases sequentially
4. Check off completed tasks in GitHub
5. Changes sync automatically

## Task Format

Tasks in `tasks.md` follow this format:
```markdown
- [ ] T001 Initialize Expo project
- [ ] T002 [P] Install dependencies (priority)
```

Creates GitHub issues:
- Clean titles (no T001 prefix)
- T001 as a label for reference
- Priority labels for [P] markers
- Phase labels from section headers

## Need Help?

- View issues: https://github.com/[owner]/[repo]/issues
- View project: https://github.com/[owner]/[repo]/projects
- Run sync manually: `./scripts/sync-to-github.sh`
- Check sync status: `./scripts/sync-to-github.sh status`
