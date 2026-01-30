---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-chess-timer-2026-01-29.md
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
workflowType: 'prd'
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
date: '2026-01-29'
---

# Product Requirements Document - chess-timer

**Author:** Ricky
**Date:** 2026-01-29

## Executive Summary

chess-timer is an installable, mobile-first web chess timer with zero App Store friction that launches fast, works offline after first load, and stays out of the way during play. It targets casual pairs, club organizers, travelers, and minimalist players who need quick setup, fast-to-use controls, and reliable turn switching with presets, custom controls, and clear recovery (pause, reset, undo). Success is measured by time-to-first-game under 60 seconds, consistent timing accuracy, and repeat use.

## Success Criteria

### User Success
- First-time users start a timed game within 60 seconds of landing.
- >=90% of first-time users complete setup without assistance or backtracking and rate setup ease >=4/5; measure in moderated usability tests (n>=15).
- <=5% of participants rate distraction >=3/5 during a 10-minute session and no critical UI interruptions occur; measure via playtest survey and session logs (n>=15).
- >=95% of participants complete pause, reset, and undo tasks on first attempt within 10 seconds each; measure in moderated usability tests (n>=15).

### Business Success
- 3 months: 1,000 installs, 300 WAU, 25% 7-day retention.
- 12 months: 10,000 installs, 2,500 WAU, 35% 30-day retention.
- Share/referral actions occur in >=10% of sessions and >=5% of new sessions originate from shared links; track monthly.

### Technical Success
- Timer drift < 100ms over 10 minutes.
- Missed tap rate <=1% in a 200-tap test.
- Offline flows pass in 100% of smoke tests after first load across supported browsers.
- Time control switches within 50ms response.
- Zero critical timing bugs in release testing and first 30 days.

## Product Scope

### MVP - Minimum Viable Product
- Installable offline PWA.
- Presets plus custom time control (base, increment, delay).
- Large tap zones for side switching.
- Pause, reset, undo.
- Sound and vibration toggles.
- Tournament-ready mode (prevent sleep/lock).
- Orientation support (portrait/landscape).
- Basic accessibility (large digits, high contrast).

### Growth Features (Post-MVP)
- Move counter.
- Simple session log.
- Shareable presets.
- Advanced preset library.

### Vision (Future)
- Theming/customization.
- Additional convenience features that keep setup < 60 seconds.

## User Journeys

### Casual Duo at Home (Alex & Sam) - Success Path
Opening Scene: It’s a late-night game at home. They don’t have a physical clock, and they want to start in under a minute.
Rising Action: Alex taps a shared link, chooses a 10+0 preset, and sets the phone between them. The UI is clean and obvious.
Climax: A single tap swaps turns instantly with a subtle haptic click; they settle into the game without fiddling.
Resolution: They finish the game without any confusion, reset in seconds, and bookmark/install the PWA for next time.

### Casual Duo at Home - Edge Case (Accidental Tap + Recovery)
Opening Scene: Midgame, Sam taps the wrong side while reaching for a piece.
Rising Action: The timer switches incorrectly and the mistake is obvious.
Climax: Sam hits “Undo” immediately; the app restores the correct player and time.
Resolution: The game continues without argument, reinforcing trust in the timer.

### Club Organizer / Teacher (Jordan) - Multi-Board Setup
Opening Scene: Jordan is running a club session with several boards and limited time to set up.
Rising Action: Jordan shares a link to students, who open the PWA on their own phones. Each pair chooses a preset and starts.
Climax: A few players pause for questions; the pause button is clear and reliable.
Resolution: Sessions run smoothly without needing to distribute physical clocks, and Jordan can start multiple games in minutes.

### Tournament Traveler (Priya) - Offline Reliability
Opening Scene: Priya is traveling with no reliable signal and wants a practice game on the go.
Rising Action: She opens the PWA from her home screen; it loads instantly offline.
Climax: The timer runs flawlessly for a full game, no drift, no delay in switches.
Resolution: She trusts it for travel practice and uses it regularly.

### Tech-Savvy Hobbyist (Morgan) - Purpose-Built Feel
Opening Scene: Morgan dislikes cluttered timer apps and wants something modern and focused.
Rising Action: Morgan customizes a 5+3 time control and enables vibration only.
Climax: The timer feels deliberate and precise, with large digits and minimal chrome.
Resolution: Morgan recommends it to friends as a “real tool,” not a gimmick.

### Support / Troubleshooting Flow (Any User)
Opening Scene: A user notices sound isn’t working or suspects the timer is off.
Rising Action: They open settings quickly, confirm sound/vibration toggles, and run a quick test start.
Climax: The issue is resolved without leaving the timer or losing a game state.
Resolution: The user regains confidence in the timer and continues play.

### Journey Requirements Summary
- Fast start flow with obvious preset selection and “start” action.
- Large, unambiguous tap zones with immediate feedback.
- Undo/recovery for accidental switches.
- Clear pause/reset controls that don’t disrupt play.
- Offline-first behavior after initial load.
- Shareable access (link-based) for multi-board sessions.
- Simple, fast settings for sound/vibration/custom time controls.
- Minimal UI with high contrast, legible digits.

### Traceability Links

| Success Criteria | Journeys | Functional Requirements |
| --- | --- | --- |
| Start a timed game within 60 seconds; setup ease >=4/5. | Casual Duo Success Path; Club Organizer Multi-Board Setup | Start game within 1s; presets list; custom control saved within 1s; last-used control preselected; repeat visit under 2s |
| Distraction <=5% rate >=3/5 during 10-minute sessions. | Casual Duo Success Path; Tech-Savvy Hobbyist | Large tap zones + switch within 50ms; high-contrast mode; large digits; sound/vibration toggles |
| Pause/reset/undo tasks >=95% success within 10 seconds. | Casual Duo Edge Case; Support/Troubleshooting | Pause/resume; reset to initial control; undo last switch |
| Share/referral actions >=10% of sessions; >=5% new sessions from shared links. | Club Organizer Multi-Board Setup; Tech-Savvy Hobbyist | Shareable URL access; installable via browser prompt; last-used control preselected |
| Timing accuracy and offline reliability targets met. | Tournament Traveler Offline Reliability; Casual Duo Success Path | Offline after first load; switch within 50ms; performance/reliability NFRs |
| Orientation support for active play. | Casual Duo Success Path; Club Organizer Multi-Board Setup | Orientation support (portrait/landscape) |

## Problem Statement

Players need a chess timer that launches instantly, works offline, and stays out of the way, because most alternatives are either physical, app-store-gated, or visually cluttered and slow to set up.

## Goals

### Product Goals
- Provide a timer that starts in under 60 seconds from first landing.
- Deliver a minimalist, modern UI that feels purpose-built.
- Support core time controls with fast switching and recovery.
- Be reliably offline after first load.

### Non-Goals
- Accounts, cloud sync, or multiplayer.
- Deep stats, ratings, or analysis.
- Full tournament management or multi-board dashboards.
- Analytics dashboard or reporting UI.
- Themes or dark mode in MVP.

## Epics and User Stories

### Epic 1: Fast Start and Setup
- As a player, I can choose a preset and start a game within seconds so we can begin immediately.
- As a player, I can create a custom control (base, increment, delay) so the clock matches our game format.
- As a returning player, I see my last-used control preselected so I can restart quickly.

### Epic 2: Reliable Turn Management
- As a player, I can switch turns with a single tap so timing stays accurate during play.
- As a player, I can pause and resume without losing time so interruptions are handled cleanly.
- As a player, I can undo the last switch so accidental taps don’t ruin the game.

### Epic 3: Offline-First and Installable
- As a player, I can use the app offline after first load so it works anywhere.
- As a player, I can install the app to my home screen so it behaves like a native tool.
- As a player, the app loads fast on repeat visits so setup stays under a minute.

### Epic 4: Accessible, Distraction-Free Experience
- As a player, I can enable high-contrast mode so the timer is readable in bright environments.
- As a player, I can enable large digits so the clock is legible at arm’s length.
- As a player, I can toggle sound and vibration so feedback matches my preference.

## Functional Requirements

### Timer Core
- User can start a game from a preset or custom control; timer starts within 1 second of tapping Start.
- User can set base time (minutes) plus increment and delay (seconds) for both sides; values are shown on the start screen and applied on first move.
- User can switch turns with one tap on either side; each tap zone is at least 40% of viewport height and a successful tap switches within 50ms.
- User can pause and resume; while paused, timers do not change and resuming restores the exact prior values.
- User can reset to the initial time control; both timers return to starting values and the active side resets.
- User can undo the most recent switch during an active game; active side and time values revert to the previous state.

### Presets and Custom Controls
- User can choose from at least 6 presets: 1+0, 3+2, 5+0, 10+0, 15+10, 30+0.
- User can create a custom control by entering base, increment, and delay; saved controls appear in the preset list within 1 second and are usable within one tap.
- User can relaunch the app with the last used control preselected.

### Settings
- User can toggle sound on/off; when off, no audio plays for turn switches or alerts.
- User can toggle vibration on/off; when off, no haptic feedback occurs for turn switches or alerts.
- User can enable tournament mode; when enabled, the screen remains awake during active play for at least 20 minutes on supported browsers, otherwise a warning banner remains visible on the timer screen until tournament mode is disabled or the game ends.
- User can enable high-contrast mode; timer text contrast meets or exceeds 4.5:1.
- User can enable large digits; timer digits are at least 48px at a 375px-wide viewport.

### Install and Offline
- User can install the app via browser prompt or menu; installed app appears on the home screen/app list.
- User can use the app offline after first successful load; start, switch, pause, reset, undo, presets, and custom controls function without network.
- User can open the app on repeat visits in under 2 seconds.

### Sharing and Orientation
- User can access the app via a shareable URL without install or account requirements; opening the URL lands on the preset/start screen within 2 seconds.
- User can rotate between portrait and landscape; timers, tap zones, and pause/reset/undo controls remain visible without scrolling, and each tap zone remains >=40% of viewport height; switching orientation preserves game state.

## Non-Functional Requirements

### Performance
- Timer drift <= 100ms over 10 minutes; measure against a reference clock during a 10-minute run. Context: preserves fairness in timed play.
- Input response median <= 50ms and 95th percentile <= 100ms; measure tap-to-UI update across 200 taps on mid-tier mobile. Context: keeps blitz and rapid play responsive.
- Turn switch reflected within 50ms; measure tap-to-timer swap across 200 taps. Context: prevents confusion during fast exchanges.

### Reliability
- Missed tap rate <= 1% in a 200-tap test; measure missed taps during controlled play. Context: avoids disputed moves and pauses.
- Game state persists across refresh or backgrounding for at least 30 minutes; verify timers and active side are unchanged after return. Context: prevents game loss during interruptions.

### Accessibility
- Default timer digits >= 48px at a 375px-wide viewport; verify computed font size. Context: readable at arm's length on phones.
- High-contrast mode meets WCAG 2.1 AA (>= 4.5:1) for timer text; verify with contrast check. Context: supports low-vision players and bright environments.
- All state changes include a non-color indicator (label or icon); verify via accessibility checklist. Context: supports color-blind users.

### Security and Privacy
- No accounts or personal data collection in MVP; verify no PII fields and no PII in analytics events. Context: reduces privacy risk and compliance burden.
- User settings and last-used control remain on-device only; verify no network persistence during settings changes. Context: ensures no user data is transmitted.

## Architecture and Data Flow (Lightweight)

### Key Components
- UI Layer: Preset/start screen, in-game timer view, settings drawer.
- Timer Engine: State machine for running/paused/ended, turn switching, undo stack.
- Persistence Layer: Local storage for last-used control, settings, and in-progress game state.
- Offline Layer: Service Worker + cache for app shell and core assets.

### Offline Cache
- Cache the app shell on first load (HTML/CSS/JS/fonts/icons) so repeat visits load offline.
- Use a network-first strategy for the landing HTML and a cache-first strategy for static assets.
- Ensure all gameplay flows (start, switch, pause, reset, undo, settings) work without network.

### Local Persistence
- Store settings (sound, vibration, contrast, tournament mode) and last-used control locally.
- Persist active game state (timers, active side, turn index, pause state) on visibility change and before unload.
- On launch, restore last game state if it is less than 30 minutes old; otherwise start fresh with last-used control.

### Timer Update Loop
- Use a high-resolution monotonic clock (e.g., performance.now) to compute elapsed time deltas.
- Run the update loop with requestAnimationFrame while the game is active and visible.
- On visibility change or backgrounding, pause the loop and persist state to avoid drift.
- Apply increment/delay on move switch, not on every tick, to keep timing stable.

## UX Requirements

### Information Architecture
- Landing: Preset list + Start action + Custom control entry.
- In-game: Two large tap zones, timers, and compact controls (pause, reset, undo).
- Settings: Sound, vibration, tournament mode, contrast.

### Interaction Details
- Single tap switches turns with immediate visual and haptic feedback.
- Pause locks both timers and disables tap zones.
- Undo restores last active player and time value.

### Edge Cases
- Backgrounding or screen lock during an active game pauses timers and preserves state; on return, the user can resume with a single tap.
- Orientation change during an active game preserves timers, active side, and control visibility without resetting.
- If Wake Lock is unavailable, show a non-blocking banner warning during active play.
- Invalid custom control inputs (negative values, zero base time) show inline validation and prevent start.

### UX Validation Checklist
- Background/resume: timers pause on backgrounding and resume without drift; state preserved after 30 minutes.
- Screen lock: wake lock prevents dimming where supported; fallback banner visible and non-blocking where unsupported.
- Orientation: no layout clipping; tap zones remain >=40% viewport height.
- Input validation: invalid custom control inputs show errors and block Start.
- Accessibility: focus visible for all controls; reduced motion disables non-essential animations.

### Visual and Brand
- Minimal, Teenage Engineering-inspired aesthetic.
- Large typography and strong hierarchy.
- Neutral palette with a single accent color for active side.

### Component States
- Timer Display: idle (no game), running (active side highlighted), paused (both dimmed), completed (zero time reached with end state).
- Tap Zones: idle (enabled), running (active side enabled), paused (disabled), error (disabled with inline message).
- Controls (pause/reset/undo): idle (available), running (available), paused (resume available), error (disabled if no game state).
- Preset List: idle (browsing), selected (highlighted), locked (hidden during active game), error (invalid preset input).
- Settings: idle (browsing), active (toggle on), disabled (if unsupported), error (validation message).

## End-to-End Test Plan

### Core Scenarios
1. **First-time preset start (online):** From landing page, select a preset and tap Start. **Pass** if game starts within 1s and active side highlights; **Fail** if start exceeds 1s or timers do not begin.
2. **Custom control validation + start:** Enter invalid values (negative/zero base), then valid values, save, and start. **Pass** if invalid input blocks Start with inline error and valid input saves within 1s and starts within 1s; **Fail** if invalid input starts or valid input does not save/start.
3. **Turn switching + undo:** During active game, switch turns 10 times, then undo once. **Pass** if each switch updates active side within 50ms and undo restores prior side/time; **Fail** if any switch exceeds 50ms or undo state is incorrect.
4. **Pause/resume integrity:** Start a game, pause for 10 seconds, resume. **Pass** if timers do not change while paused and resume continues from exact prior values; **Fail** if time changes while paused or resumes incorrectly.
5. **Reset flow:** Start a game, play 30 seconds, reset. **Pass** if both timers return to initial control and active side resets; **Fail** if any time or active side persists.
6. **Offline reliability (post-first-load):** Load once online, go offline, relaunch, and start a preset game with switches/pause/undo. **Pass** if app loads and all core controls work offline; **Fail** if app fails to load or any core control is broken.
7. **Orientation change during play:** Start a game, rotate between portrait and landscape. **Pass** if game state persists and tap zones/controls remain visible without scrolling; **Fail** if state resets or controls/tap zones clip.
8. **Install + launch from home screen:** Trigger install, open from home screen, start a game. **Pass** if app opens within 2s and start works; **Fail** if launch exceeds 2s or start fails.

## Browser Matrix

- Mobile: iOS Safari and Android Chrome (latest 2 major versions).
- Desktop: Chrome, Edge, Safari, Firefox (latest 2 major versions).
- Unsupported: legacy browsers that lack Service Worker or Wake Lock support should show a friendly warning and continue with degraded features.

## Responsive Design

- Mobile-first, single-column layout that keeps the timer as the primary focus.
- Support portrait and landscape with tap zones and timers always visible.
- Use safe-area insets for notches and system UI overlays.
- Ensure controls remain reachable on 360px-wide devices and scale for tablets/desktops without adding clutter.

## Performance Targets

- LCP <= 2.5s on mid-tier mobile over 4G; measure with Lighthouse mobile profile and 4G throttling. Context: ensures fast first use.
- INP <= 200ms for core timer interactions; measure via web-vitals sampling of in-game taps. Context: keeps play responsive.
- CLS <= 0.1 on first load; measure via Lighthouse or web-vitals on initial load. Context: prevents layout shifts during setup.
- Repeat visit load <= 2s (cached); measure on second visit with warmed cache on mid-tier mobile. Context: supports quick restarts.

## SEO Strategy

- Indexable landing page with clear title, meta description, and canonical URL.
- Open Graph/Twitter metadata for share previews.
- Sitemap and robots.txt to allow indexing of the landing page only.

## Accessibility Level

- Target WCAG 2.1 AA for contrast and interaction; verify with automated audit and manual review. Context: baseline accessibility compliance.
- Minimum contrast ratio 4.5:1 for text and active timer states; verify with contrast checker. Context: readability in bright environments.
- Touch targets >= 44px for all tappable controls; verify CSS pixel sizes at 360px-wide viewport. Context: reduce mis-taps.
- Visible focus styles and support for reduced motion; verify keyboard focus on all controls and reduced-motion setting disables non-essential motion. Context: accessibility for keyboard and motion-sensitive users.

## Data and Analytics

### Events
- App open
- Game start
- Preset selected
- Custom control saved
- Turn switch
- Pause / resume
- Reset
- Undo
- PWA install

### Event Properties
- App open: entry_source (direct/share), install_state (installed/web), platform (iOS/Android/Desktop), network_state (online/offline).
- Game start: control_type (preset/custom), base_minutes, increment_seconds, delay_seconds, first_session (true/false).
- Preset selected: preset_id, base_minutes, increment_seconds, delay_seconds.
- Custom control saved: base_minutes, increment_seconds, delay_seconds.
- Turn switch: turn_index, elapsed_seconds, active_side (white/black).
- Pause / resume: action (pause/resume), elapsed_seconds, active_side.
- Reset: elapsed_seconds, control_type.
- Undo: elapsed_seconds, turn_index, active_side.
- PWA install: install_surface (prompt/menu), accepted (true/false).

### Instrumentation Completeness Metrics
- Property coverage target for core events (App open, Game start, Turn switch, Pause/resume, Reset, Undo, PWA install): >=98% of events include all required properties listed above.
- Optional property coverage: >=90% for any optional properties added later; required vs optional defined in schema.
- Release gate: fail analytics QA if any core event drops below 95% required-property coverage in staging samples.

### Metrics
- Time-to-first-game
- Session length
- Repeat sessions per user
- PWA install rate
- Install-to-weekly-active ratio
- Undo usage rate

### Segmentation Notes
- Split key metrics by install_state (installed/web) and platform (iOS/Android/Desktop).
- Track entry_source (direct/share) for time-to-first-game and share/referral impact.
- Compare preset vs custom control usage for session length and repeat sessions.
- Segment offline vs online sessions for reliability and retention impact.

### Retention Analysis Plan
- Cohort construction: weekly cohorts based on first Game start date (UTC week start Monday); include users with at least one Game start in the cohort week.
- Retention definition: returning if App open or Game start occurs on D1, D7, or D30 after cohort start; report D1/D7/D30 percentages.
- Review cadence: D1/D7 reviewed weekly; D30 reviewed monthly with rolling 3-cohort average.

### Analytics QA Plan
- Event schema validation on staging before each release (required properties present, correct types).
- Sample 20 sessions per platform (iOS/Android/Desktop) monthly to verify event counts and timing.
- Alert if event volume drops >20% week-over-week for core events (App open, Game start, Turn switch).
- Quarterly audit of event definitions against product metrics to prevent drift.

### Instrumentation QA Dashboards
- Event delivery latency p95 < 5 minutes for core events (App open, Game start, Turn switch) over last 24h; alert if >10 minutes for 2 consecutive hours.
- App open -> Game start conversion within +-15% of 28-day baseline; alert if drops >20% day-over-day.
- Required property completeness for Game start >= 99% daily; alert if <97%.
- Turn switch events per Game start within 10-200 (daily median); alert if outside range for any platform.

### Analytics Ownership and SLAs
- Owner: Product + Engineering jointly responsible for KPI definitions and dashboards.
- KPI review cadence: weekly for acquisition/activation, monthly for retention.
- Incident SLA: investigate tracking anomalies within 2 business days of alert.

## Risks and Mitigations

- **Timer drift on mobile browsers:** use high-resolution timers and background-safe scheduling; test across iOS/Android.
- **Missed taps during fast play:** large tap zones and immediate feedback; use touch event handling with minimal debounce.
- **PWA install friction:** provide clear in-app hints for install; avoid full-screen prompts that interrupt first play.
- **Device sleep during play:** tournament mode sets wake lock; provide fallback messaging if unsupported.

## Assumptions

- Users have modern mobile browsers that support PWA features.
- Most play happens on phones, not tablets or desktops.
- Users prefer presets over deep configuration.

## Dependencies

- Browser support for PWA install and offline cache.
- Wake Lock API availability or fallback.

## Open Questions

- Exact preset list for MVP (confirm tournament and casual standards).
- Default haptic and sound behavior on first launch.
- Whether to include a quick “switch sides” prompt on first use.

## Milestones

### MVP Build
- Core timer engine and UI.
- Presets and custom control.
- Pause/reset/undo.
- PWA offline support and installability.

### MVP Validation
- Real-play tests for drift and missed taps.
- First-time user time-to-start measurement.
- Install and offline reliability checks.
