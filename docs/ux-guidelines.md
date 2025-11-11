# Cricket Scoring UX Guidelines

## 1. Readability in Full Sun
- Target WCAG AA+ contrast: ≥4.5:1 for body text, ≥3:1 for large text, and aim for AAA 7:1 on critical numerals (score, balls, wickets).
- Never rely on color alone; pair hues with copy, icons, shape, or texture cues (e.g., legal/illegal ball states).
- Provide touch targets ≥44×44 pt on iOS and ≥48×48 dp (~9 mm) on Android with enough spacing to avoid accidental taps.
- Support Dynamic Type / scalable text, avoid thin weights, and prefer semibold for numerals and labels.
- Use filled, simple icons with strokes ≥2 px to survive glare and low-contrast conditions.
- Offer an "Outdoor Mode" theme: dark text on off-white or pastel yellow cards, clear keylines (≥3:1 component contrast), and desaturated accents that still pass contrast.

## 2. Thumb-Friendly, One-Hand Layouts
- Keep primary actions near the bottom (thumb zone) while reserving the top bar for passive status info.
- Give critical taps—0/1/4/6, UNDO, WICKET—larger hit areas than secondary controls.

## 3. Cricket-Native Input Patterns
- Ball pad: large grid covering 0–7 to match typical scoring.
- Extras row (toggles): WD, NB, BYE, LBYE; allow combinations (e.g., NB + 4) and enforce Law-accurate scoring (NB penalty run plus additional runs; byes/leg-byes as appropriate).
- Require hold-to-confirm (700–900 ms) for WICKET to cut mis-taps.
- Show a legal-delivery counter (“Ball 5 / Over 12”) that increments only on legal balls (6 legal deliveries per over).
- Present a timeline strip of the last 2–3 balls with tap-to-edit and keep UNDO always visible; easy undo beats modal confirmations.
- Mirror umpire signaling by showing a tiny “scorer ack” tick beside each logged event once confirmed.

## 4. Multisensory Feedback
- Deliver light haptics on ball entry, stronger haptics when overs complete or wickets fall, and respect system haptic settings.
- Use short (50–150 ms) percussive clicks that cut through crowd noise and provide a fast mute control.

## 5. Performance in Heat and Sun
- Assume devices will auto-dim as they heat; keep high-contrast layouts legible at reduced brightness.
- Minimize animations, cache assets, prefer solid fills, and avoid long-running GPS/camera usage to save battery and thermal headroom.

## 6. Offline-First Reliability
- Store an append-only event log (ball events) that resolves conflicts with timestamp + over/ball index, then sync later.
- Surface optimistic UI states with a visible “Syncing / Last saved” badge and use background workers with retries for spotty connections.

## 7. Platform Affordances for Matches
- Keep screens awake while scoring (Android: `FLAG_KEEP_SCREEN_ON`; iOS: `UIApplication.isIdleTimerDisabled = true`).
- Anticipate sweat/gloves: large targets, extra spacing, leverage Android glove mode or iOS Touch Accommodations to filter jitter.

## 8. Proposed Scoring Screen
- **Top (read-only):** Teams, over/ball, bowler, striker, totals, wickets using high-contrast large numerals.
- **Middle:** Ball timeline (last three events) with tap-to-edit.
- **Bottom (thumb zone):**
  - Runs: `[0] [1] [2] [3] [4] [6] [+1]` with big buttons (double-tap 4 to fire boundary haptic).
  - Extras toggles: `[WD] [NB] [BYE] [LB]`—multiple selections allowed with clear state changes.
  - `[WICKET]` (hold-to-confirm), `[UNDO]` (single tap), `[END OVER]` (enabled after six legal balls).
- Provide an Outdoor Mode toggle in the header; persist per match and enforce larger text plus AAA contrast for primary readouts.

## 9. Quick Checklist
- AA contrast for all text, AAA for score and ball counters.
- 44×44 pt / 48×48 dp minimum targets with ≥8 dp spacing.
- Support Dynamic Type; avoid ultra-thin fonts.
- Don’t encode meaning by color alone.
- Fire haptics on completion events only; always honor system settings.
- Keep the screen awake while scoring and fail gracefully if the OS still dims.
- Design offline-first with optimistic entries and visible sync state.
- Map every action to Laws of Cricket (no-ball, byes, leg-byes logic).
