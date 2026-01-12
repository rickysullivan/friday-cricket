# Agent Guide

This file is for agentic coding assistants working in this repo.
Keep it current and practical; prefer repo facts over assumptions.

## OpenSpec
<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Project Summary
- Vite + React PWA for cricket scorekeeping.
- Offline-first UX with optional Supabase sync for spectators.
- UI built with Tailwind classes in React components.

## Build / Lint / Test Commands
These are the scripts defined in `package.json`.

### Install
- `npm install`

### Dev Server
- `npm run dev`

### Production Build
- `npm run build`

### Preview Build
- `npm run preview`

### Lint
- No lint script defined in `package.json`.
- If linting is needed, add a script first or ask the user.

### Tests
- No test script or runner is configured in `package.json`.
- If tests are required, confirm the intended test framework first.
- Single test guidance: unavailable until a test runner exists.

## Repo Structure (High Level)
- `src/index.jsx` bootstraps the app.
- `src/main.jsx` contains the main React UI.
- `src/hooks/` contains custom hooks (notifications, sync).
- `src/lib/supabase.js` contains Supabase client helpers.
- `public/` hosts PWA assets and the custom service worker.

## Code Style Guidelines

### Language & Modules
- ES modules (`import` / `export`).
- React with functional components and hooks.
- Prefer plain JS/JSX patterns already in use unless the user requests TS.

### Formatting
- Semicolons are used consistently; keep them.
- Double quotes appear in some JSX class strings; follow existing file style.
- Keep JSX props aligned and wrapped for readability when long.
- Prefer short, readable expressions over dense inline logic.

### Imports
- Order: React first, third-party packages next, local modules last.
- Group related imports; avoid unused imports.
- Use named exports for hooks and helpers where already established.

### Naming Conventions
- Components: `PascalCase` (e.g., `FridayCricketTracker`).
- Hooks: `useCamelCase` (e.g., `useGameSync`).
- Helpers: `camelCase` (e.g., `generateGameId`).
- Constants: `UPPER_SNAKE_CASE` for module-level constants.

### Components & Hooks
- Keep hooks pure: side effects belong in `useEffect`.
- Use `useCallback` for event handlers or functions passed as props.
- Avoid introducing new global state unless needed.

### State & Data Flow
- Local state managed via `useState`.
- Sync state via `useGameSync` when Supabase is configured.
- Persist session state to `localStorage` only when needed.

### Error Handling
- Prefer non-blocking error handling; log via `console.warn`/`console.error`.
- Return `null` or safe fallbacks instead of throwing from UI code.
- Avoid interrupting offline flow; degrade gracefully when Supabase is absent.

### PWA / Service Worker
- Prefer Service Worker notifications for PWA compatibility.
- Keep notification options consistent and tagged for replacement.
- Avoid intrusive prompts; respect current permission state.

### Supabase Usage
- Supabase is optional and guarded by `isSupabaseConfigured`.
- Always check configuration before network calls.
- Do not assume presence of `.env` secrets in local dev.

### UI / Styling
- Tailwind utility classes live inline in JSX.
- Keep class strings readable; avoid massive one-liners.
- Use existing visual patterns (buttons, modals) for consistency.

## Git Workflow
- Trunk-based development.
- Small, focused commits when asked by the user.
- Do not amend commits unless the user explicitly requests it.

## Existing Agent Notes (Kept)
The following operational notes are retained and still apply.

### GitHub Sync Script (`scripts/sync-to-github.sh`)
- Follow the critical checklist before running.
- Always use `--limit 200` with `gh` list commands.
- macOS `sed -i ''` is required for in-place edits.
- Avoid subshells in loops; use process substitution.

### Debugging Principles
- Validate assumptions early.
- Test in isolation with dummy data.
- Verify end state with explicit counts.
- Document new learnings here.

## Cursor / Copilot Rules
- No `.cursorrules`, `.cursor/rules/`, or `.github/copilot-instructions.md` detected in this repo.
