# Change: Add game variant selection for standard and transition cricket

## Why
The app currently assumes a single scoring format built around configurable pairs and overs-per-pair. With the new Friday Transition Cricket program, scorers need a clear way to choose match type up front and have scoring behavior, setup limits, and spectator sync reflect that choice.

## What Changes
- Add a setup-time game variant selector so users can choose between Standard Friday Cricket and Transition Cricket.
- Introduce variant rule profiles sourced from club rule documents so setup controls, innings totals, and in-game prompts follow the selected format.
- Persist the selected variant in local game state and include it in Supabase game state sync payloads.
- Keep viewer/join behavior backward compatible so existing games without explicit variant metadata still render safely.

## Rule Cross-Check Basis
- Standard Friday Cricket (`docs/Friday night cricket.docx`): 8-12 players, 16 overs per team, batters in pairs with up to 4 overs per pair.
- Transition Cricket (`docs/Friday night transition cricket rules.pdf`): 6-10 players, 16 overs per team, batters in pairs with over allocation split across players.
- Shared rules with no scoring-model change needed: no LBW, 6-ball overs, wicket=end change, field rotation each over, and free-hit flow for bad balls.

## Impact
- Affected specs: `game-variants` (new)
- Affected code:
  - `src/components/screens/SetupScreen.jsx`
  - `src/store/useGameStore.js`
  - `src/main.jsx`
  - `src/hooks/useGameSync.js`
